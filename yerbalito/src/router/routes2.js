
import Reports from "../components/pages/reports/Reports";
import FondoCamp from "../components/pages/payments/FC";

import Squads from "../components/pages/squads/Squads";
import Payments from "../components/pages/payments/Payments";
import Player from "../components/pages/squads/Player";

export const routes2 = [

  {
    id: "player",
    path: "/player/:id",
    Element: Player,
  },
  {
    id: "squads",
    path: "/squads",
    Element: Squads,
  },
  {
    id: "payments",
    path: "/payments",
    Element: Payments,
  },
  {
    id: "fc",
    path: "/fc",
    Element: FondoCamp,
  },
  {
    id: "reports",
    path: "/reports",
    Element: Reports,
  },

];
