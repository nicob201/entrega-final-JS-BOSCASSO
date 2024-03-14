// LISTA DE PREGUNTAS
let preguntas = [];

// PREGUNTAS Y RESPUESTAS
let questions = document.getElementById("question-container");
let respuestaUsuario = [];

// FUNCION PARA CARGAR LAS PREGUNTAS
function cargarPreguntas() {
  return new Promise((resolve, reject) => {
    fetch("preguntas.json")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error al cargar las preguntas");
        }
      })
      .then((data) => {
        preguntas = data;
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// BOTON PARA AGREGAR O QUITAR PREGUNTAS AL CUESTIONARIO
let numberOfQuestions = document.getElementById("numberOfQuestions");
let sumar = document.getElementById("sum");
let restar = document.getElementById("less");
let aceptar = document.getElementById("confirm-button");
let contador = 1;

sumar.onclick = () => {
  if (contador === 5) {
    sumar.disabled = true;
    restar.disabled = false;
  } else {
    contador++;
    numberOfQuestions.innerHTML = contador;
  }
};

restar.onclick = () => {
  if (contador === 1) {
    restar.disabled = true;
    sumar.disabled = false;
  } else {
    contador--;
    numberOfQuestions.innerHTML = contador;
  }
};

// EVENTO DEL BOTON "ACEPTAR"
aceptar.onclick = async () => {
  try {
    await cargarPreguntas();

    let arrayOfQuestions = preguntas.slice(0, contador);
    questions.innerHTML = "";

    arrayOfQuestions.forEach((pregunta, index) => {
      let container = document.createElement("div");
      let options = pregunta.opciones;
      container.className = "container";
      container.innerHTML = `<h4>${pregunta.pregunta}</h4>
                            <ul>${options
                              .map(
                                (o, i) =>
                                  `<li><input type="radio" name="question${index}" value="${i}">${o}</li>`
                              )
                              .join("")}
                          </ul>`;

      // EVENTO PARA TOMAR LA OPCION SELECCIONADA POR EL USUARIO
      let radioInputs = container.querySelectorAll('input[type="radio"]');
      radioInputs.forEach((radio) => {
        radio.addEventListener("change", (event) => {
          const selectedValue = event.target.value;
          const respuestaKey = `respuestaUsuario_${index}`;
          localStorage.setItem(respuestaKey, JSON.stringify(selectedValue));
          respuestaUsuario[index] = selectedValue;
        });
      });
      questions.appendChild(container);
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// FUNCION PARA CALCULAR TOTAL DE PUNTOS
function calcularPuntuacion() {
  let puntuacion = 0;

  for (let i = 0; i < preguntas.length; i++) {
    const respuestaCorrecta = preguntas[i].respuestaCorrecta;
    const respuestaUsuarioActual = respuestaUsuario[i];
    if (
      respuestaUsuarioActual !== undefined &&
      parseInt(respuestaUsuarioActual) === respuestaCorrecta
    ) {
      puntuacion += 10;
    } else {
      puntuacion += 0;
    }
  }
  // PASAR CANTIDAD DE PUNTOS AL HTML
  let sumaPuntos = document.getElementById("point-counter");
  sumaPuntos.innerHTML = `${puntuacion}`;
  localStorage.setItem("puntuacion_usuario", puntuacion);
}

// FUNCION PARA OBTENER Y MOSTRAR PUNTUACIÓN ALMACENADA EN LOCALSTORAGE
function mostrarPuntuacionAlmacenada() {
  let puntuacionAlmacenada = localStorage.getItem("puntuacion_usuario");
  let mensajePuntuacion = document.getElementById("last-point-score");
  mensajePuntuacion.innerHTML =
    puntuacionAlmacenada !== null ? puntuacionAlmacenada : "-";
}

// FUNCION PARA INDICAR LA RESPUESTA CORRECTA DE CADA PREGUNTA
function opcionCorrecta() {
  preguntas.forEach((pregunta, index) => {
    const respuestaCorrecta = pregunta.respuestaCorrecta;
    const opciones = document.getElementsByName(`question${index}`);
    opciones.forEach((opcion, i) => {
      const container = opcion.parentElement;
      const mensaje = document.createElement("span");
      if (parseInt(opcion.value) === respuestaCorrecta) {
        mensaje.textContent = "correcta";
        mensaje.classList.add("correcto");
      } else {
        mensaje.textContent = "incorrecta";
        mensaje.classList.add("incorrecto");
      }
      container.appendChild(mensaje);
    });
  });
}

// BOTON PARA FINALIZAR CUESTIONARIO Y CALCULAR LOS PUNTOS
let botonCalcularPuntuacion = document.getElementById("finish-test-button");
botonCalcularPuntuacion.onclick = () => {
  calcularPuntuacion();
  mostrarPuntuacionAlmacenada();
  opcionCorrecta();
  Swal.fire({
    text: `Tu puntaje obtenido fue: ${localStorage.getItem(
      "puntuacion_usuario"
    )}`,
  });
};

// BOTON PARA REINICIAR
let restartButton = document.getElementById("restart-button");
restartButton.onclick = () => {
  Swal.fire({
    title: "¿Estas seguro que quieres reiniciar?",
    text: "Se perderan todas tus respuestas",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Reiniciar",
  }).then((result) => {
    if (result.isConfirmed) {
      respuestaUsuario = [];
      contador = 1;
      numberOfQuestions.innerHTML = contador;
      questions.innerHTML = "";
      let sumaPuntos = document.getElementById("point-counter");
      sumaPuntos.innerHTML = "0";
      Swal.fire({
        title: "¡Listo!",
        text: "Tu progreso fue reestablecido",
        icon: "success",
      });
    }
  });
};

// GUARDAR NOMBRE INGRESADO EN LOCALSTORAGE
function guardarNombre() {
  let nombreIngresado = document.getElementById("nombre").value;
  localStorage.setItem("nombre_usuario", nombreIngresado);
}
document.getElementById("name-button").addEventListener("click", guardarNombre);

// MOSTRAR SALUDO
function saludarUsuario() {
  let saludo = localStorage.getItem("nombre_usuario");
  if (saludo) {
    let contenedorSaludo = document.getElementById("greets");
    contenedorSaludo.innerHTML = `<p>¡Hola ${saludo}, vamos a jugar!</p>`;
  }
}

saludarUsuario();
