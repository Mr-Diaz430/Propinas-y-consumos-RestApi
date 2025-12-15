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
        
        // si colocamos parentesis en la funcion, esta se ejecutara y no esperara a que ocurra el evento "onchange", SI espera en caso de quitar los () pero ya no podremos enviar información.
        /* Ejemplo
        * se ejecuta: agregarPlatillo(platillo.id) X
        * espera pero sin parametros: agregarPlatillo X
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
        // Eliminar elemento cuando la cantidad es 0
        console.log('No es mayor que 0');
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }

    limpiarHTML();

    // Mostrar Resumen
    actualizarResumen();
}


function actualizarResumen() {
    console.log('Desde actualizar resumen...');
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    
    // Informacion mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    
    
    // Informacion hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora';
    hora.classList.add('fw-bold');
    
    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');
    
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);
    

    // Titulo de la sección
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');


    // Iterar pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4'); 
        nombreEl.textContent = 'nombre';

        // Cantidad del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // Subtotal del articulo
        const subTotalEl = document.createElement('P');
        subTotalEl.classList.add('fw-bold');
        subTotalEl.textContent = 'Subtotal: ';

        const subTotalValor = document.createElement('SPAN');
        subTotalValor.classList.add('fw-normal');
        subTotalValor.textContent = precio * cantidad;

        // Valores agregados a sus respectivos contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subTotalEl.appendChild(subTotalValor);

        // Valores agregados a la lista
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subTotalEl);

        grupo.appendChild(lista);
    });

    // Agregar contenido
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);
    resumen.appendChild(grupo);
    
    contenido.appendChild(resumen);
} 

function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}