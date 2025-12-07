export const dictionary = [
    "Pizza", "Sushi", "Hamburguesa", "Taco", "Paella", "Helado", "Chocolate", "Café", "Cerveza", "Vino",
    "Perro", "Gato", "León", "Elefante", "Tigre", "Delfín", "Águila", "Caballo", "Mono", "Pingüino",
    "Futbol", "Baloncesto", "Tenis", "Natación", "Ciclismo", "Voleibol", "Béisbol", "Golf", "Boxeo", "Karate",
    "Playa", "Montaña", "Bosque", "Desierto", "Isla", "Rio", "Lago", "Volcán", "Cascada", "Cueva",
    "Coche", "Avión", "Barco", "Tren", "Bicicleta", "Moto", "Autobús", "Helicóptero", "Submarino", "Cohete",
    "Médico", "Bombero", "Policía", "Maestro", "Cocinero", "Ingeniero", "Astronauta", "Pintor", "Músico", "Actor",
    "Guitarra", "Piano", "Batería", "Violín", "Flauta", "Trompeta", "Saxofón", "Micrófono", "Auriculares", "Altavoz",
    "Móvil", "Ordenador", "Tablet", "Reloj", "Cámara", "Televisión", "Radio", "Consola", "Dron", "Robot",
    "Zapato", "Camiseta", "Pantalón", "Vestido", "Sombrero", "Gafas", "Chaqueta", "Calcetines", "Guantes", "Bufanda",
    "Libro", "Bolígrafo", "Lápiz", "Cuaderno", "Mochila", "Silla", "Mesa", "Cama", "Lámpara", "Espejo",
    "Sol", "Luna", "Estrella", "Nube", "Lluvia", "Nieve", "Viento", "Rayo", "Arcoíris", "Tornado",
    "Primavera", "Verano", "Otoño", "Invierno", "Día", "Noche", "Amanecer", "Atardecer", "Mediodía", "Medianoche",
    "Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado", "Rosa", "Negro", "Blanco", "Gris",
    "Manzana", "Plátano", "Naranja", "Fresa", "Uva", "Sandía", "Melón", "Piña", "Kiwi", "Mango",
    "Pan", "Leche", "Queso", "Huevo", "Mantequilla", "Yogur", "Jamón", "Salchicha", "Tocino", "Chorizo"
];

// Pares de palabras relacionadas para modo difícil
// [palabra_civiles, palabra_impostores]
// Las palabras están relacionadas temáticamente pero NO son sinónimos
export const relatedWords = [
    // Animales relacionados pero diferentes
    ["Perro", "Gato"],
    ["León", "Tigre"],
    ["Ballena", "Tiburón"],
    ["Águila", "Halcón"],
    ["Caballo", "Cebra"],
    ["Elefante", "Rinoceronte"],
    ["Mono", "Gorila"],
    ["Delfín", "Orca"],
    ["Serpiente", "Lagarto"],
    ["Abeja", "Avispa"],

    // Comida relacionada pero diferente
    ["Pizza", "Hamburguesa"],
    ["Sushi", "Ramen"],
    ["Café", "Chocolate"],
    ["Cerveza", "Whisky"],
    ["Helado", "Tarta"],
    ["Pan", "Galleta"],
    ["Leche", "Queso"],
    ["Manzana", "Pera"],
    ["Plátano", "Kiwi"],
    ["Fresa", "Cereza"],

    // Lugares relacionados
    ["Playa", "Montaña"],
    ["Bosque", "Selva"],
    ["Desierto", "Tundra"],
    ["Río", "Océano"],
    ["Lago", "Estanque"],
    ["Volcán", "Géiser"],
    ["Cueva", "Mina"],
    ["Isla", "Península"],

    // Transportes relacionados
    ["Coche", "Moto"],
    ["Avión", "Globo"],
    ["Barco", "Canoa"],
    ["Tren", "Tranvía"],
    ["Bicicleta", "Patinete"],
    ["Autobús", "Taxi"],
    ["Helicóptero", "Parapente"],
    ["Submarino", "Buzo"],

    // Profesiones relacionadas
    ["Médico", "Veterinario"],
    ["Bombero", "Salvavidas"],
    ["Policía", "Detective"],
    ["Maestro", "Bibliotecario"],
    ["Cocinero", "Camarero"],
    ["Ingeniero", "Arquitecto"],
    ["Astronauta", "Piloto"],
    ["Pintor", "Escultor"],
    ["Músico", "Bailarín"],
    ["Actor", "Director"],

    // Instrumentos musicales
    ["Guitarra", "Violín"],
    ["Piano", "Órgano"],
    ["Batería", "Tambor"],
    ["Flauta", "Clarinete"],
    ["Trompeta", "Tuba"],
    ["Saxofón", "Oboe"],

    // Tecnología
    ["Móvil", "Tablet"],
    ["Ordenador", "Calculadora"],
    ["Cámara", "Proyector"],
    ["Televisión", "Monitor"],
    ["Radio", "Podcast"],
    ["Consola", "Arcade"],
    ["Dron", "Satélite"],
    ["Robot", "Androide"],

    // Ropa relacionada
    ["Zapato", "Sandalia"],
    ["Camiseta", "Jersey"],
    ["Pantalón", "Falda"],
    ["Vestido", "Traje"],
    ["Sombrero", "Boina"],
    ["Gafas", "Monocular"],
    ["Chaqueta", "Abrigo"],
    ["Calcetines", "Pantis"],
    ["Guantes", "Mitones"],
    ["Bufanda", "Chal"],

    // Objetos de casa
    ["Silla", "Sofá"],
    ["Mesa", "Estantería"],
    ["Cama", "Hamaca"],
    ["Lámpara", "Vela"],
    ["Espejo", "Ventana"],
    ["Libro", "Periódico"],
    ["Bolígrafo", "Rotulador"],
    ["Lápiz", "Carboncillo"],
    ["Cuaderno", "Diario"],
    ["Mochila", "Maleta"],

    // Clima y naturaleza
    ["Sol", "Fuego"],
    ["Luna", "Estrella"],
    ["Nube", "Niebla"],
    ["Lluvia", "Granizo"],
    ["Nieve", "Escarcha"],
    ["Viento", "Huracán"],
    ["Rayo", "Relámpago"],
    ["Arcoíris", "Aurora"],

    // Tiempo
    ["Primavera", "Otoño"],
    ["Verano", "Invierno"],
    ["Día", "Noche"],
    ["Amanecer", "Atardecer"],
    ["Mediodía", "Medianoche"],

    // Colores relacionados
    ["Rojo", "Rosa"],
    ["Azul", "Violeta"],
    ["Verde", "Turquesa"],
    ["Amarillo", "Oro"],
    ["Naranja", "Coral"],
    ["Morado", "Lila"],
    ["Negro", "Gris"],
    ["Blanco", "Plata"],

    // Deportes relacionados
    ["Fútbol", "Hockey"],
    ["Baloncesto", "Balonmano"],
    ["Tenis", "Bádminton"],
    ["Natación", "Buceo"],
    ["Ciclismo", "Motociclismo"],
    ["Voleibol", "Waterpolo"],
    ["Béisbol", "Cricket"],
    ["Golf", "Minigolf"],
    ["Boxeo", "Lucha"],
    ["Karate", "Judo"],

    // Extras variados
    ["Micrófono", "Megáfono"],
    ["Auriculares", "Altavoz"],
    ["Reloj", "Brújula"],
    ["Cascada", "Fuente"],
    ["Huevo", "Nido"],
    ["Jamón", "Salami"],
    ["Mantequilla", "Margarina"],
    ["Yogur", "Nata"],
    ["Salchicha", "Chorizo"],
    ["Tocino", "Panceta"]
];
