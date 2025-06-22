import {
  LocationProvider,
  Route,
  Router,
  hydrate,
  prerender as ssr,
} from "preact-iso";
import Teambuilder from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import "./style.css";

export function App() {
  return (
    <LocationProvider>
      <main class="pad">
        <Router>
          <Route path="/teambuilder/" component={Teambuilder} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
