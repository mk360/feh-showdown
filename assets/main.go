package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

type ChannelIconData struct {
	Name string
	URL  string
}

type IconResponse struct {
	Cargoquery []struct {
		Title struct {
			Icon string `json:"icon"`
			Name string `json:"name"`
		} `json:"title"`
	} `json:"cargoquery"`
}

var cleanupRegex, regexErr = regexp.Compile(`/revision.+$`)

func getSkills(offset int) IconResponse {
	var query = url.Values{}
	query.Add("action", "cargoquery")
	query.Add("format", "json")
	query.Add("tables", "Skills")
	query.Add("fields", "Icon, Name")
	query.Add("limit", "500")
	if offset != 0 {
		query.Add("offset", strconv.Itoa(offset))
	}
	query.Add("where", "Scategory != \"weapon\" and Icon != \"\"")

	var url = "https://feheroes.fandom.com/api.php?" + query.Encode()

	var res, _ = http.Get(url)
	var byteData, _ = io.ReadAll(res.Body)
	var response IconResponse
	json.Unmarshal(byteData, &response)

	return response
}

var client = &http.Client{
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	},
}

func fetchIconHostedURL(iconURL string, iconName string, assetMap *map[string]string, mutex *sync.Mutex) {
	resp, err := client.Get("https://feheroes.fandom.com/wiki/Special:Redirect/file/" + strings.ReplaceAll(iconURL, " ", "_"))
	if err == nil && resp.StatusCode == http.StatusMovedPermanently {
		location := cleanupRegex.ReplaceAllString(resp.Header.Get("Location"), "")
		mutex.Lock()
		(*assetMap)[iconName] = location
		mutex.Unlock()
	}
}

func main() {
	if regexErr != nil {
		log.Fatalln(regexErr)
	}

	const maxWorkers = 10

	type Skill struct {
		Icon string
		Name string
	}

	var assetMap = make(map[string]string)
	var assetMapMu = sync.Mutex{}
	var wg sync.WaitGroup

	skillChan := make(chan Skill)

	// Worker pool
	for range maxWorkers {
		go func() {
			for skill := range skillChan {
				fetchIconHostedURL(skill.Icon, skill.Name, &assetMap, &assetMapMu)
				wg.Done()
			}
		}()
	}

	var offset int = 0
	for {
		skillsResponse := getSkills(offset)
		if len(skillsResponse.Cargoquery) == 0 {
			break
		}
		offset += len(skillsResponse.Cargoquery)

		for _, skill := range skillsResponse.Cargoquery {
			wg.Add(1)
			skillChan <- Skill{
				Icon: skill.Title.Icon,
				Name: skill.Title.Name,
			}
		}
	}

	close(skillChan)
	wg.Wait()

	var sortedSkillMap = map[string]map[string]string{}

	for skillName, skillIconURL := range assetMap {
		var letter = string(skillName[0])
		_, letterExists := sortedSkillMap[letter]

		if !letterExists {
			sortedSkillMap[letter] = map[string]string{}
		}

		sortedSkillMap[letter][skillName] = skillIconURL
	}

	for letter, content := range sortedSkillMap {
		var contentBytes, _ = json.Marshal(content)
		os.WriteFile("../public/skill-icon-sheets/skills_icon_"+letter+".json", contentBytes, 0644)
	}
}
