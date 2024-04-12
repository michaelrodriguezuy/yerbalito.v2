import "../home/Home.css";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="container">
      <h1>Página no encontrada</h1>
      {/* <p class="zoom-area">
        <b>CSS</b> animations to make a cool 404 page.{" "}
      </p> */}
      <section class="error-container">
        <span>
          <span>4</span>
        </span>
        <span>0</span>
        <span>
          <span>4</span>
        </span>
      </section>
      <div class="link-container">
        <a target="_blank" href="/" class="more-link">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
