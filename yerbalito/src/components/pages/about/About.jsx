import Typography from "@mui/material/Typography";

const About = () => {
  return (
    <div className="container" style={{ textAlign: "center",maxHeight: "100vh", overflowY: "auto"  }}>

      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        style={{ margin: "60px 0" }}
      >
        Un poco sobre el Club
      </Typography>

      <Typography variant="body1" gutterBottom style={{ margin: "40px 100px" }}>
        El Club Yerbalito de Baby Fútbol es una Institución fundada el 19 de
        Abril de 1978, situada en la ciudad de Treinta y Tres, y que en el año
        2015 logró tramitar y obtener la personería jurídica (231/2013); se
        dedica a la práctica de fútbol infantil, donde recibe semanalmente a más
        de 150 niños y niñas, pero hace algunos años viene desarrollando otras
        actividades conexas en beneficio del crecimiento físico y mental de los
        niños y niñas que en ésta participan, lo cual le permite realizar una
        tarea social considerada muy importante para la sociedad.
      </Typography>

      <Typography variant="body1" gutterBottom style={{ margin: "40px 100px" }}>
        Cuenta con un “merendero” dónde todos los niños y niñas después de cada
        práctica son invitados a tomar un vaso de leche preparada con un
        sándwich de pan con dulce y una fruta, lo que le permite además del
        hecho de la propia colación, un momento de intercambio y de
        sociabilización entre ellos y ellas, donde se trabajan otros valores
        fundamentales como el respeto, igualdad y tolerancia. Esta tarea es
        realizable gracias a la colaboración de algunos padres que se han puesto
        esta responsabilidad al hombro y la realizan diariamente y de forma
        honoraria. El Club también cuenta con un profesor de Educación Física
        que trabaja junto a los orientadores técnicos en el desarrollo
        psico-físico de los niños y niñas.
      </Typography>

      <Typography variant="body1" gutterBottom style={{ margin: "40px 100px" }}>
        En la parte de infraestructura, el predio cuenta con unos 5.000 mts2,
        donde existe una cancha de 40 x 60 mts bordeada con un tejido de alambre
        el cual es mantenido en óptimas condiciones para evitar el acceso y para
        el mejor cuidado y mantenimiento de ésta, en uno de sus laterales cuenta
        con tribunas móviles que permiten ser trasladadas en caso de necesidad,
        y un predio adyacente que se utiliza para actividades de las prácticas,
        también cuenta con una construcción con 2 vestuarios y baños de
        caballeros y damas por separado. Hace tres años se logró construir una
        cantina que permite vender insumos y recaudar dinero los días de
        partidos de local.
      </Typography>

      <Typography variant="body1" gutterBottom style={{ margin: "40px 100px" }}>
        En el mes de Abril de 2019, la institución concretó la compra de un
        contenedor de 40 pies, un sueño anhelado por todos y con el objetivo de
        transformarlo en merendero, ya que hasta ese momento se brindaba la
        merienda en uno de los vestuarios que mide 3 x 2 mts, algunos parados y
        otros a la intemperie debido al poco espacio, lo cual no es lo más
        adecuado sobre todo en la época de invierno. En el año 2023 se logró
        adecuar el contenedor, revistiéndolo con yeso en su interior
        convirtiéndolo en un lugar acondicionado y cobijado de las inclemencias
        del tiempo. Además, teniendo como objetivo de que no solo los niños y
        niñas de nuestra institución concurran al merendero, sino también poder
        acercar al resto de los niños y niñas del barrio y desarrollar una tarea
        social que vaya más allá de la órbita del propio club.
      </Typography>
    </div>
  );
};

export default About;
