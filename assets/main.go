package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gorilla/mux"
)

type IconResponse struct {
	Cargoquery []struct {
		Title struct {
			Icon string `json:"icon"`
		} `json:"title"`
	} `json:"cargoquery"`
}

func sendRequest(skillName string) string {
	var query = url.Values{}
	query.Add("action", "cargoquery")
	query.Add("format", "json")
	query.Add("tables", "Skills")
	query.Add("fields", "Icon")
	query.Add("where", "Name = \""+skillName+"\"")

	var url = "https://feheroes.fandom.com/api.php?" + query.Encode()

	var res, _ = http.Get(url)
	var byteData, _ = io.ReadAll(res.Body)
	var response IconResponse
	json.Unmarshal(byteData, &response)

	return response.Cargoquery[0].Title.Icon
}

func cacheImage(path string, skillName string) {
	var res, _ = http.Get(path)
	var byteData, _ = io.ReadAll(res.Body)
	os.WriteFile("./cache/"+skillName+".png", byteData, 0644)
}

func main() {
	_, err := os.Stat("./cache")
	if err != nil {
		os.Mkdir("cache", 0644)
	}

	var server = mux.NewRouter()
	server.Use(mux.CORSMethodMiddleware(server))
	server.HandleFunc("/img/{skillname}", func(res http.ResponseWriter, req *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				res.WriteHeader(404)
			}
		}()
		var skillName = strings.ReplaceAll(mux.Vars(req)["skillname"], ";", "/")
		var icon = strings.ReplaceAll(sendRequest(skillName), " ", "_")
		if _, err := os.Stat("./cache/" + skillName + ".png"); err != nil {
			var imgPath = "https://feheroes.fandom.com/wiki/Special:Redirect/file/" + icon
			go cacheImage(imgPath, skillName)
			res.Header().Add("Location", imgPath)
			res.WriteHeader(302)
		} else {
			var fileData, _ = os.ReadFile("./cache/" + skillName + ".png")
			res.Write(fileData)
		}
	}).Methods("GET")

	http.ListenAndServe(":3479", server)
}
