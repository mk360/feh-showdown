package main

import (
	"net/http"
	"os"
)

func main() {
	_, err := os.Stat("./cache")
	if err != nil {
		os.Mkdir("cache", 0644)
	}

	var server = http.NewServeMux()
	server.HandleFunc("/img", func(res http.ResponseWriter, req *http.Request) {
		req.ParseForm()
		req.PathValue()
	})

	http.ListenAndServe(":3479", server)
}
