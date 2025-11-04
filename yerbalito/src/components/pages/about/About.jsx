import Typography from "@mui/material/Typography";
import { Paper, Box } from "@mui/material";

const About = () => {
  return (
    <div className="page-container-scroll">
      <div className="content-container">
        {/* Header inspirado en alexandergarcia.me */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #4CAF50, #ffffff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Sobre nosotros
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}
          >
            Conoce nuestra historia, misión y el impacto que generamos en la comunidad
          </Typography>
        </Box>
        
        <Paper 
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            overflow: "visible"
          }}
        >
                  <Typography variant="body1" sx={{ color: "white", textAlign: "justify", lineHeight: "1.8" }}>
                    El Club Yerbalito de Baby Fútbol es una Institución fundada el 19 de
                    Abril de 1978, situada en la ciudad de Treinta y Tres, y que en el año
                    2015 logró tramitar y obtener la personería jurídica (231/2013); se
                    dedica a la práctica de fútbol infantil, donde recibe semanalmente a más
                    de 150 niños y niñas, pero hace algunos años viene desarrollando otras
                    actividades conexas en beneficio del crecimiento físico y mental de los
                    niños y niñas que en ésta participan, lo cual le permite realizar una
                    tarea considerada muy importante para la sociedad.
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: "white", textAlign: "justify", lineHeight: "1.8", mt: 3 }}>
                    Cuenta con un "merendero" dónde todos los niños y niñas después de cada
                    práctica son invitados a tomar un vaso de leche preparada con un
                    sándwich de pan con dulce y una fruta, lo que le permite además del
                    hecho de la propia colación, un momento de intercambio y de
                    sociabilización entre ellos y ellas, donde se trabajan otros valores
                    fundamentales como el respeto, igualdad y tolerancia.
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: "white", textAlign: "justify", lineHeight: "1.8", mt: 3 }}>
                    En la parte de infraestructura, el predio cuenta con unos 5.000 mts2,
                    donde existe una cancha de 40 x 60 mts bordeada con un tejido de alambre
                    el cual es mantenido en óptimas condiciones para evitar el acceso y para
                    el mejor cuidado y mantenimiento de ésta, en uno de sus laterales cuenta
                    con tribunas móviles que permiten ser trasladadas en caso de necesidad.
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: "white", textAlign: "justify", lineHeight: "1.8", mt: 3 }}>
                    En el mes de Abril de 2019, la institución concretó la compra de un
                    contenedor de 40 pies, un sueño anhelado por todos y con el objetivo de
                    transformarlo en merendero. En el año 2023 se logró adecuar el contenedor,
                    revistiéndolo con yeso en su interior convirtiéndolo en un lugar acondicionado
                    y cobijado de las inclemencias del tiempo.
                  </Typography>
                  
                  {/* Comisión del Club */}
                  <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                    <Typography variant="h5" sx={{ color: "#4CAF50", fontWeight: "bold", mb: 3, textAlign: "center" }}>
                      🏆 COMISIÓN DIRECTIVA 2025
                    </Typography>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                      gap: "20px",
                      textAlign: "center"
                    }}>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Presidente
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Julio Martinez
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Vice-Presidente
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Gonzalo Cesar
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Secretario
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          [Nombre del Secretario]
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Pro-Secretario
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          [Nombre del Pro-Secretario]
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Tesorero
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Fatima
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          Pro-Tesorero
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white" }}>
                          [Nombre del Pro-Tesorero]
                        </Typography>
                      </div>
                    </div>
                  </div>
        </Paper>
      </div>
    </div>
  );
};

export default About;
