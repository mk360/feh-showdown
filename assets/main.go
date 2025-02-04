package main

import (
	"encoding/json"
	"fmt"
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

func main() {
	_, err := os.Stat("./cache")
	if err != nil {
		os.Mkdir("cache", 0644)
	}

	var server = mux.NewRouter()
	server.Use(mux.CORSMethodMiddleware(server))
	server.HandleFunc("/img/{skillname}", func(res http.ResponseWriter, req *http.Request) {
		fmt.Println(mux.Vars(req))
		defer func() {
			if err := recover(); err != nil {
				res.WriteHeader(404)
			}
		}()
		var skillName = strings.ReplaceAll(mux.Vars(req)["skillname"], ";", "/")
		var icon = strings.ReplaceAll(sendRequest(skillName), " ", "_")
		res.Header().Add("Location", "https://feheroes.fandom.com/wiki/Special:Redirect/file/"+icon)
		res.WriteHeader(302)
	}).Methods("GET")

	http.ListenAndServe(":3479", server)
}
