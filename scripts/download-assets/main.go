package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

var client = http.Client{}

type Wikiname struct {
	Cargoquery []struct {
		Title struct {
			WikiName string `json:"WikiName"`
		} `json:"title"`
	} `json:"cargoquery"`
}

type SkillWikiName struct {
	Cargoquery []struct {
		Title struct {
			WikiName string `json:"WikiName"`
			Name     string `json:"Name"`
		} `json:"title"`
	} `json:"cargoquery"`
}

var invalidFileNameChars = regexp.MustCompile(`[<>:"/\\|?*]`)

func getWikiname(characterName string) string {
	var query = url.Values{
		"action": []string{"cargoquery"},
		"format": []string{"json"},
		"tables": []string{"Units"},
		"fields": []string{"WikiName"},
		"where":  []string{"_pageName = \"" + characterName + "\""},
	}

	var req, _ = http.NewRequest("GET", "https://feheroes.fandom.com/api.php?"+query.Encode(), nil)
	var res, _ = client.Do(req)
	var byteResponse, _ = io.ReadAll(res.Body)
	var name Wikiname
	json.Unmarshal(byteResponse, &name)

	return name.Cargoquery[0].Title.WikiName
}

func getThumbnail(wikiname string, standardName string) {
	var encodedName = strings.ReplaceAll(wikiname, " ", "_")
	var res, _ = http.Get("https://feheroes.fandom.com/wiki/Special:Filepath/" + encodedName + "_Face_FC.webp")
	var byteData, _ = io.ReadAll(res.Body)
	os.WriteFile("../../public/thumbnails/"+standardName+".webp", byteData, 0644)
}

func getRawIcon(wikiname string, standardName string) {
	var encodedName = strings.ReplaceAll(wikiname, " ", "_")
	var filename = invalidFileNameChars.ReplaceAllString(standardName, "")
	var res, _ = http.Get("https://feheroes.fandom.com/wiki/Special:Filepath/" + encodedName + ".png")
	var byteData, _ = io.ReadAll(res.Body)
	os.WriteFile("../../public/skills/"+filename+".png", byteData, 0644)
}

func getPortrait(wikiname string, standardName string) {
	var encodedName = strings.ReplaceAll(wikiname, " ", "_")
	var res, _ = http.Get("https://feheroes.fandom.com/wiki/Special:Filepath/" + encodedName + "_Face.webp")
	var byteData, _ = io.ReadAll(res.Body)
	os.WriteFile("../../public/portraits/"+standardName+".webp", byteData, 0644)
}

func fetchCharacter(name string, waitGroup *sync.WaitGroup, reg regexp.Regexp) {
	var wikiname = getWikiname(name)
	var savedFileName = strings.ToLower(reg.ReplaceAllLiteralString(name, ""))
	getThumbnail(wikiname, savedFileName)
	getPortrait(wikiname, savedFileName)
	waitGroup.Done()
}

func fetchSkills(letter string, waitGroup *sync.WaitGroup) {
	var offset = 0

	var query = url.Values{
		"action": []string{"cargoquery"},
		"format": []string{"json"},
		"tables": []string{"Skills"},
		"fields": []string{"WikiName, Name"},
		"offset": []string{strconv.Itoa(offset)},
		"where":  []string{"Scategory in (\"passivea\", \"passiveb\", \"passivec\") and Name like \"" + letter + "%\""},
	}

	waitGroup.Add(1)
	for {
		var req, _ = http.NewRequest("GET", "https://feheroes.fandom.com/api.php?"+query.Encode(), nil)
		var res, _ = client.Do(req)
		var byteResponse, _ = io.ReadAll(res.Body)
		var name SkillWikiName
		json.Unmarshal(byteResponse, &name)
		for _, skill := range name.Cargoquery {
			getRawIcon(skill.Title.WikiName, skill.Title.Name)
		}
		if len(name.Cargoquery) == 500 {
			offset += 500
		} else {
			waitGroup.Done()
			break
		}
	}
}

func fetchSacredSeals(letter string, waitGroup *sync.WaitGroup) {
	var offset = 0

	var query = url.Values{
		"action":  []string{"cargoquery"},
		"format":  []string{"json"},
		"tables":  []string{"SacredSealCosts, Skills"},
		"fields":  []string{"SacredSealCosts.Skill=WikiName, Skills.Name"},
		"offset":  []string{strconv.Itoa(offset)},
		"where":   []string{"Skills.Name like \"" + letter + "%\""},
		"join_on": []string{"SacredSealCosts.Skill = Skills.Name"},
	}

	waitGroup.Add(1)
	for {
		var req, _ = http.NewRequest("GET", "https://feheroes.fandom.com/api.php?"+query.Encode(), nil)
		var res, _ = client.Do(req)
		var byteResponse, _ = io.ReadAll(res.Body)
		fmt.Println(string(byteResponse))
		var name SkillWikiName
		json.Unmarshal(byteResponse, &name)
		for _, skill := range name.Cargoquery {
			getRawIcon(skill.Title.WikiName, skill.Title.Name)
		}
		if len(name.Cargoquery) == 500 {
			offset += 500
		} else {
			waitGroup.Done()
			break
		}
	}
}

func main() {
	var wg sync.WaitGroup
	var formatNameRegex, e = regexp.Compile("[ :]")
	if e != nil {
		panic(e)
	}
	var jsonMap = make(map[string]interface{})
	var jsonData, _ = os.ReadFile("../../src/data/characters.json")
	json.Unmarshal(jsonData, &jsonMap)
	for _, letter := range []string{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"} {
		go fetchSkills(letter, &wg)
		go fetchSacredSeals(letter, &wg)
	}
	for character := range jsonMap {
		wg.Add(1)
		go fetchCharacter(character, &wg, *formatNameRegex)
	}
	wg.Wait()
}
