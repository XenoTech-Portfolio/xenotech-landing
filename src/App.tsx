import { useEffect, useState } from "react";
import { LabSite } from "./lab/LabSite";
import { AutomazioniLab } from "./lab/AutomazioniLab";

/* Routing interno via hash. La landing (scura, immersiva) è la home;
   "#/automazioni" è la sottopagina dei servizi di automazione. */
function useHashRoute() {
  const getRoute = () =>
    window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "/";
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

export default function App() {
  const route = useHashRoute();
  if (route === "/automazioni") return <AutomazioniLab />;
  return <LabSite />;
}
