package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
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

func main() {
	var wg sync.WaitGroup
	var formatNameRegex, e = regexp.Compile("[ :]")
	if e != nil {
		panic(e)
	}
	var jsonMap = make(map[string]interface{})
	var jsonData, _ = os.ReadFile("../../src/data/characters.json")
	json.Unmarshal(jsonData, &jsonMap)
	for character := range jsonMap {
		wg.Add(1)
		go fetchCharacter(character, &wg, *formatNameRegex)
	}
	wg.Wait()
}
