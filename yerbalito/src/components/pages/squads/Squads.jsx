import PlayersCard from "../../layout/player/PlayersCards";

const Squads = () => {
  return (
    <div
      className="container"
      style={{
        textAlign: "center",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <PlayersCard />
    </div>
  );
};

export default Squads;
