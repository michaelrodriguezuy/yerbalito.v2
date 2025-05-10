import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1>Página no encontrada</h1>
      {/* <p class="zoom-area">
        <b>CSS</b> animations to make a cool 404 page.{" "}
      </p> */}
      <section className="error-container">
        <span>
          <span>4</span>
        </span>
        <span>0</span>
        <span>
          <span>4</span>
        </span>
      </section>
      <div className="link-container">
        {/* no quiero que habra una nueva ventana sino que use la misma */}
        
        <a target="_self" href="/" className="more-link" >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
