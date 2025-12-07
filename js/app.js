let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

let categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [ mesa, hora ].some(campo => campo === "");
    if (camposVacios) {

        const existeAlerta = document.querySelector('.invalid-feedback');

        if (!existeAlerta) {
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            
            setTimeout(() => {
                alerta.remove();
            }, 2000);
        }

        return;
    } 

    // Asignar datos del formulario a cliente
    cliente = { ...cliente, mesa, hora };

    // Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    mostrarSecciones();

    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

async function obtenerPlatillos() {
    const url = 'http://localhost:3000/platillos';

    try {
        const response = await fetch(url);
        if(!response.ok) throw new Error (response.status);
        const data = await response.json();

        mostrarPlatillos(data)

    } catch (error) {
        throw error;
    }
}


function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');
        
        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;
        
        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;
        
        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];
        
        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');
        
        // si colocamos parentesis en la funcion, esta se ejecutara y no esperara a que ocurra el evento "onchange", si espera en caso de quitar los () pero ya no podremos enviar información.
        /* Ejemplo
        * se ejecuta: agregarPlatillo(platillo.id)
        * espera: agregarPlatillo
        * solucion (espera y puede enviar parametros): function(){agregarPlatillo(platillo.id)} -> funcion LINEAL
        */
        inputCantidad.onchange = function() {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };


        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);
        
            
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);
        contenido.appendChild(row);
        
    })
}


function agregarPlatillo(producto){

    let { pedido } = cliente; 

    // cantidad > 0
    if (producto.cantidad > 0) {

        if (pedido.some(articulo => articulo.id === producto.id)) {
            // Si existe el articulo
            const pedidoActualizado = pedido.map( articulo => {
                if (articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            cliente.pedido = [...pedidoActualizado];

        }else{
            // No existe el articulo
            cliente.pedido = [...pedido, producto];
        }
        
    }else{
        console.log('No es mayor que 0');
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }

    console.log(cliente.pedido);
}