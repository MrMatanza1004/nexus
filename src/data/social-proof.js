// 500 reseñas realistas para SocialProof
// Generadas a partir de combinaciones de nombres, acciones y ubicaciones

const nombres = [
  'María', 'Carlos', 'Ana', 'Juan', 'Sofía', 'Diego', 'Valentina', 'Andrés',
  'Camila', 'Luis', 'Gabriela', 'Pedro', 'Isabella', 'Jorge', 'Lucía', 'Miguel',
  'Fernanda', 'Alejandro', 'Carolina', 'Roberto', 'Daniela', 'Pablo', 'Elena',
  'Santiago', 'Laura', 'Fernando', 'Valeria', 'Ricardo', 'Adriana', 'Hugo',
  'Ximena', 'Javier', 'Mariana', 'Gustavo', 'Natalia', 'Raúl', 'Paula', 'Iván',
  'Regina', 'Óscar', 'Liliana', 'Eduardo', 'Silvia', 'Mauricio', 'Teresa',
  'Rafael', 'Patricia', 'Arturo', 'Mónica', 'Alberto', 'Claudia', 'Felipe',
  'Rosa', 'Vicente', 'Lorena', 'Emilio', 'Raquel', 'Manuel', 'Cristina',
  'Esteban', 'Diana', 'Guillermo', 'Ángela', 'Marcos', 'Leticia', 'Julián',
  'Fabiola', 'Héctor', 'Graciela', 'Rubén', 'Brenda', 'Ramiro', 'Alicia',
  'Ignacio', 'Alejandra', 'Rodrigo', 'Verónica', 'Francisco', 'Marisol',
  'Gerardo', 'Esmeralda', 'Salvador', 'Rebeca', 'Armando', 'Margarita',
  'Leonardo', 'Jimena', 'Martín', 'Carmen', 'César', 'Inés', 'Omar',
  'Marcela', 'Iván', 'Pilar', 'Enrique', 'Lourdes', 'Víctor', 'Andrea',
  'Agustín', 'Ruth', 'Sebastián', 'Amanda', 'David', 'Bárbara', 'Joaquín',
  'Rocío', 'Alonso', 'María José', 'Tomás', 'Paulina', 'Jonathan', 'Sara',
  'Lorenzo', 'Lizbeth', 'Emiliano', 'Beatriz', 'Nicolás', 'Yesenia',
  'Mario', 'Soledad', 'Aldo', 'Gladys', 'Saúl', 'Xiomara', 'Marco',
  'Dulce', 'Cristóbal', 'Noemí', 'Rolando', 'Celeste', 'Kevin', 'Yanet',
  'Abel', 'Miriam', 'Edgar', 'Susana', 'Alan', 'Rita', 'Humberto', 'Elisa',
  'Josué', 'Sandra', 'Isaac', 'Norma', 'Aaron', 'Eloísa', 'Rogelio',
  'Evelyn', 'Edmundo', 'Irma', 'Elías', 'Luisa', 'Leandro', 'Dora',
  'Ulises', 'Yolanda', 'Facundo', 'Marta', 'Bruno', 'Olga', 'Ramón',
  'Nélida', 'Darío', 'Aurora', 'Wilfredo', 'Mirta', 'Osvaldo', 'Gloria',
  'Ezequiel', 'Susy', 'Aníbal', 'Pamela', 'Renato', 'Emma', 'Paul', 'Ada',
  'Joel', 'Zulema', 'Ismael', 'Eliana', 'Simón', 'Betty', 'Gregorio', 'Tania',
  'Emmanuel', 'Myriam', 'Reyes', 'Iris', 'Fidel', 'Vanesa', 'Gael', 'Lidia',
  'Yahir', 'Marlene', 'Noé', 'Karla', 'Eliseo', 'Flor', 'Erick', 'Perla',
  'Gonzalo', 'Aleida', 'Uriel', 'Orquídea', 'Néstor', 'Sonia', 'Tadeo',
  'Rosario', 'Jesús', 'Lilia', 'Moisés', 'Concepción', 'Efraín', 'Antonia',
  'Timoteo', 'Eva', 'Fabricio', 'Esther', 'Homero', 'Aída', 'Damián',
  'Juana', 'Fausto', 'Erika', 'Heriberto', 'Nora', 'Eleazar', 'Reyna',
  'Jairo', 'Araceli', 'Natanael', 'Celia', 'Benjamín', 'Mayra', 'Elmer',
  'Rosalba', 'Abrahám', 'Clara', 'Ezequías', 'Delia', 'Rigoberto', 'Luz',
  'Cipriano', 'Ofelia', 'Nehemías', 'Socorro', 'Eligio', 'Nelly',
  'Teodoro', 'Zoraida', 'Amadeo', 'Maribel', 'Bonifacio', 'Etelvina',
  'Silverio', 'Viviana', 'Arnoldo', 'Genoveva', 'Calixto', 'Melisa',
  'Epifanio', 'Hermelinda', 'Feliciano', 'Marina', 'Nicodemo', 'Estela',
  'Saturnino', 'Margoth', 'Ambrosio', 'Catarina', 'Arcángel', 'Salomé',
]

const apellidos = [
  'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González',
  'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
  'Díaz', 'Vázquez', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Chávez',
  'Álvarez', 'Castillo', 'Romero', 'Moreno', 'Jiménez', 'Mendoza',
  'Ruiz', 'Aguilar', 'Medina', 'Gutiérrez', 'Contreras', 'Castro',
  'Vargas', 'Ramos', 'Rojas', 'Ortega', 'Delgado', 'Vega', 'Pena',
  'Cárdenas', 'Molina', 'Núñez', 'Guerrero', 'Figueroa', 'Valdez',
  'Sandoval', 'Salazar', 'Rivas', 'Espinoza', 'Acosta', 'Campos',
  'Padilla', 'Cortés', 'Navarro', 'Bravo', 'Miranda', 'Soto', 'León',
  'Ibarra', 'Carrillo', 'Maldonado', 'Vera', 'Gallegos', 'Mejía',
  'Ponce', 'Cervantes', 'Escobar', 'Zamora', 'Domínguez', 'Salinas',
  'Barrera', 'Velázquez', 'Rosales', 'Herrera', 'Tapia', 'Franco',
  'Parra', 'Calderón', 'Rangel', 'Solis', 'Ríos', 'Zavala', 'Alvarado',
  'Escalante', 'Montoya', 'Trejo', 'Corona', 'Orozco', 'Saucedo',
  'Barajas', 'Zúñiga', 'Manriquez', 'Pineda', 'Lara', 'Luna', 'Arias',
  'Sierra', 'Bautista', 'Valenzuela', 'Cuevas', 'Rueda', 'Infante',
  'Lozano', 'Palacios', 'Muro', 'Magaña', 'Alonso', 'Olivares',
  'Puente', 'Serrato', 'Briseño', 'Barragán', 'Pedraza', 'Arredondo',
  'Calvillo', 'Mireles', 'Becerra', 'Tejeda', 'Henríquez', 'Vallejo',
  'Luján', 'Lerma', 'Gálvez', 'Ocampo', 'Nájera', 'Botello', 'Leyva',
  'Sedano', 'Cedillo', 'Uribe', 'Zapata', 'Berríos', 'Castañeda',
  'Vanegas', 'Coronel', 'Mondragón', 'Badillo', 'Rojo', 'Villagrán',
  'Chacón', 'Mascorro', 'Pardo', 'Cordero', 'Jaimes', 'Pelayo',
  'Bernal', 'Almazán', 'Arce', 'Ojeda', 'Rosas', 'Villalobos',
  'Alcaraz', 'Carrera', 'López', 'Arroyo', 'Muñoz', 'Cervantes',
  'Ferrer', 'Valdivia', 'Castellanos', 'Bermúdez', 'Dueñas', 'Linares',
  'Perales', 'Peñaloza', 'Dávalos', 'Toledo', 'Ochoa', 'Anguiano',
  'Fajardo', 'Márquez', 'Guerra', 'Mateos', 'Preciado', 'Huerta',
  'Callejas', 'Andrade', 'Mota', 'Olivas', 'Alcalá', 'Mancilla',
  'Llamas', 'Coronado', 'Alanís', 'Aguilera', 'Garza', 'Cantú',
  'Patiño', 'Guajardo', 'Lozano', 'Cavazos', 'Reyna', 'Báez', 'Romo',
  'Galván', 'Anaya', 'Cisneros', 'Estrada', 'Rentería', 'Ayala',
  'Vásquez', 'Solís', 'Félix', 'Zamora', 'Robles', 'Murillo',
]

const acciones = [
  'acaba de crear su primer proyecto',
  'generó una propuesta de ${monto}',
  'registró un nuevo cliente',
  'facturó ${monto} este mes',
  'completó 8 tareas hoy',
  'actualizó su portafolio',
  'firmó un contrato nuevo',
  'alcanzó su meta mensual',
  'envió una propuesta exitosa',
  'creó una factura por ${monto}',
  'inició un nuevo proyecto freelance',
  'cobró ${monto} por su último trabajo',
  'subió 5 archivos a File Vault',
  'cerró un trato con un cliente nuevo',
  'organizó su pipeline de ventas',
  'escribió una nota en su diario',
  'actualizó su perfil profesional',
  'compartió su link de afiliado',
  'generó un contrato legal',
  'exportó su reporte de taxes',
  'completó su registro de horas',
  'movió un lead a negociación',
  'ganó un proyecto nuevo',
  'añadió 3 tareas al kanban',
  'registró ${monto} en ingresos',
  'actualizó sus metas del mes',
  'creó una plantilla de propuesta',
  'invitó un cliente al portal',
  'descargó su factura en PDF',
  'compartió su portafolio',
  'recibió un pago de ${monto}',
  'evaluó sus métricas del mes',
  'creó un nuevo proyecto',
  'asignó tareas a su equipo',
  'programó una reunión con cliente',
  'revisó su dashboard financiero',
  'actualizó su catálogo de servicios',
  'marcó una tarea como completada',
  'envió un recordatorio de pago',
  'generó un reporte de ganancias',
  'configuró sus notificaciones',
  'añadió un testimonio de cliente',
  'personalizó su plantilla de contrato',
  'vinculó su cuenta de Stripe',
  'activó su link de pago',
  'creó su primer lead en CRM',
  'graduó un lead a cliente',
  'actualizó su tarifa por hora',
  'revisó propuestas pendientes',
  'archivó un proyecto completado',
]

const ubicaciones = [
  'Argentina', 'México', 'Colombia', 'España', 'Chile', 'Perú',
  'Venezuela', 'Ecuador', 'Guatemala', 'Cuba', 'Bolivia', 'República Dominicana',
  'Honduras', 'Paraguay', 'El Salvador', 'Nicaragua', 'Costa Rica',
  'Panamá', 'Uruguay', 'Puerto Rico', 'Estados Unidos',
  'Buenos Aires, Argentina', 'Ciudad de México, México', 'Bogotá, Colombia',
  'Madrid, España', 'Santiago, Chile', 'Lima, Perú', 'Medellín, Colombia',
  'Caracas, Venezuela', 'Quito, Ecuador', 'Guadalajara, México',
  'Monterrey, México', 'Barcelona, España', 'Valencia, España',
  'Córdoba, Argentina', 'Rosario, Argentina', 'Mendoza, Argentina',
  'La Paz, Bolivia', 'Asunción, Paraguay', 'Montevideo, Uruguay',
  'San José, Costa Rica', 'San Juan, Puerto Rico', 'Cancún, México',
  'Barranquilla, Colombia', 'Cali, Colombia', 'Maracaibo, Venezuela',
  'Santa Cruz, Bolivia', 'Santo Domingo, RD', 'San Salvador, El Salvador',
  'Tegucigalpa, Honduras', 'Managua, Nicaragua', 'Panamá, Panamá',
  'Miami, USA', 'Los Ángeles, USA', 'Houston, USA', 'Nueva York, USA',
  'Austin, USA', 'Orlando, USA', 'Chicago, USA', 'Dallas, USA',
]

function generarMonto() {
  const montos = ['$800', '$1,200', '$2,500', '$3,000', '$1,800', '$5,000', '$950', '$2,000', '$1,500', '$4,200', '$750', '$3,500', '$6,000', '$1,100', '$2,800', '$900', '$1,600', '$7,500', '$550', '$10,000']
  return montos[Math.floor(Math.random() * montos.length)]
}

function personalizarAccion(accion) {
  return accion.replace('${monto}', generarMonto())
}

// Generar 500 reseñas únicas
const reseñas = []

// Usamos un Set para evitar duplicados exactos
const usados = new Set()

while (reseñas.length < 500) {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)]
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)]
  const nombreCompleto = `${nombre} ${apellido}`
  const accionBase = acciones[Math.floor(Math.random() * acciones.length)]
  const accion = personalizarAccion(accionBase)
  const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)]

  const key = `${nombreCompleto}|${accion}`
  if (!usados.has(key)) {
    usados.add(key)
    reseñas.push({ name: nombreCompleto, action: accion, location: ubicacion })
  }
}

// Función para obtener reseñas en orden aleatorio (barajar Fisher-Yates)
function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export const socialProofs = reseñas
export const socialProofsBarajados = barajar(reseñas)
export default reseñas
