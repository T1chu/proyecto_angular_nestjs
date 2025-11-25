// social-network-backend/seed-data.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://tizianomedina:Test1234@cluster0.zeyvyey.mongodb.net/redsocial?retryWrites=true&w=majority&appName=Cluster0';

// Schemas
const UserSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  correo: { type: String, unique: true },
  nombreUsuario: { type: String, unique: true },
  contrasena: String,
  fechaNacimiento: Date,
  descripcion: String,
  imagenPerfil: String,
  perfil: { type: String, default: 'usuario' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const PublicationSchema = new mongoose.Schema({
  titulo: String,
  mensaje: String,
  imagen: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meGusta: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  mensaje: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication' },
  modificado: { type: Boolean, default: false },
}, { timestamps: true });

// Models
const User = mongoose.model('User', UserSchema);
const Publication = mongoose.model('Publication', PublicationSchema);
const Comment = mongoose.model('Comment', CommentSchema);

async function seed() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos anteriores...');
    await User.deleteMany({});
    await Publication.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Datos limpiados');

    // Crear usuarios
    console.log('👤 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('Test1234', 10);
    
    const usuarios = await User.insertMany([
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@test.com',
        nombreUsuario: 'juanperez',
        contrasena: hashedPassword,
        fechaNacimiento: new Date('1990-05-15'),
        descripcion: 'Desarrollador full stack',
        perfil: 'usuario',
        activo: true,
      },
      {
        nombre: 'María',
        apellido: 'García',
        correo: 'maria@test.com',
        nombreUsuario: 'mariagarcia',
        contrasena: hashedPassword,
        fechaNacimiento: new Date('1992-08-20'),
        descripcion: 'Diseñadora UX/UI',
        perfil: 'usuario',
        activo: true,
      },
      {
        nombre: 'Carlos',
        apellido: 'López',
        correo: 'carlos@test.com',
        nombreUsuario: 'carloslopez',
        contrasena: hashedPassword,
        fechaNacimiento: new Date('1988-03-10'),
        descripcion: 'Product Manager',
        perfil: 'usuario',
        activo: true,
      },
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        correo: 'admin@test.com',
        nombreUsuario: 'admin',
        contrasena: hashedPassword,
        fechaNacimiento: new Date('1985-01-01'),
        descripcion: 'Administrador del sistema',
        perfil: 'administrador',
        activo: true,
      },
    ]);
    console.log(`✅ ${usuarios.length} usuarios creados`);

    // Crear publicaciones
    console.log('📝 Creando publicaciones...');
    const publicaciones = await Publication.insertMany([
      {
        titulo: 'Mi primera publicación',
        mensaje: '¡Hola a todos! Esta es mi primera publicación en la red social.',
        usuario: usuarios[0]._id,
        meGusta: [usuarios[1]._id, usuarios[2]._id],
        activo: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
      },
      {
        titulo: 'Consejos de diseño',
        mensaje: 'Aquí algunos consejos para mejorar tus diseños UX/UI...',
        usuario: usuarios[1]._id,
        meGusta: [usuarios[0]._id, usuarios[2]._id, usuarios[3]._id],
        activo: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Hace 4 días
      },
      {
        titulo: 'Nuevas tecnologías',
        mensaje: 'Las últimas tendencias en desarrollo web son increíbles.',
        usuario: usuarios[0]._id,
        meGusta: [usuarios[1]._id],
        activo: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
      },
      {
        titulo: 'Product Management 101',
        mensaje: 'Consejos esenciales para ser un buen Product Manager.',
        usuario: usuarios[2]._id,
        meGusta: [usuarios[0]._id, usuarios[1]._id, usuarios[3]._id],
        activo: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
      },
      {
        titulo: 'Anuncio del sistema',
        mensaje: 'Bienvenidos a nuestra nueva plataforma social.',
        usuario: usuarios[3]._id,
        meGusta: [usuarios[0]._id, usuarios[1]._id, usuarios[2]._id],
        activo: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
      },
      {
        titulo: 'Aprendiendo NestJS',
        mensaje: 'NestJS es un framework increíble para backend.',
        usuario: usuarios[0]._id,
        meGusta: [usuarios[2]._id, usuarios[3]._id],
        activo: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // Hace 12 horas
      },
    ]);
    console.log(`✅ ${publicaciones.length} publicaciones creadas`);

    // Crear comentarios
    console.log('💬 Creando comentarios...');
    const comentarios = await Comment.insertMany([
      // Comentarios en publicación 1
      {
        mensaje: '¡Bienvenido! Excelente primera publicación.',
        usuario: usuarios[1]._id,
        publicacion: publicaciones[0]._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      },
      {
        mensaje: 'Me alegra que te unas a la comunidad.',
        usuario: usuarios[2]._id,
        publicacion: publicaciones[0]._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        mensaje: '¡Genial tenerte aquí!',
        usuario: usuarios[3]._id,
        publicacion: publicaciones[0]._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      
      // Comentarios en publicación 2
      {
        mensaje: 'Excelentes consejos, los voy a aplicar.',
        usuario: usuarios[0]._id,
        publicacion: publicaciones[1]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      },
      {
        mensaje: '¿Podrías compartir más sobre diseño de interfaces?',
        usuario: usuarios[2]._id,
        publicacion: publicaciones[1]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        mensaje: 'Muy útil, gracias por compartir.',
        usuario: usuarios[3]._id,
        publicacion: publicaciones[1]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      {
        mensaje: 'Me encanta este contenido.',
        usuario: usuarios[0]._id,
        publicacion: publicaciones[1]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
      
      // Comentarios en publicación 3
      {
        mensaje: 'Totalmente de acuerdo, el desarrollo web evoluciona constantemente.',
        usuario: usuarios[1]._id,
        publicacion: publicaciones[2]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      },
      {
        mensaje: '¿Cuáles consideras las más importantes?',
        usuario: usuarios[2]._id,
        publicacion: publicaciones[2]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      
      // Comentarios en publicación 4
      {
        mensaje: 'Como desarrollador, estos consejos me ayudan mucho.',
        usuario: usuarios[0]._id,
        publicacion: publicaciones[3]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      },
      {
        mensaje: 'Súper interesante, más contenido así por favor.',
        usuario: usuarios[1]._id,
        publicacion: publicaciones[3]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        mensaje: 'Guardado para referencia futura.',
        usuario: usuarios[3]._id,
        publicacion: publicaciones[3]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      
      // Comentarios en publicación 5
      {
        mensaje: '¡Gracias por la bienvenida!',
        usuario: usuarios[0]._id,
        publicacion: publicaciones[4]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      },
      {
        mensaje: 'Excelente plataforma, me encanta.',
        usuario: usuarios[1]._id,
        publicacion: publicaciones[4]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      
      // Comentarios en publicación 6
      {
        mensaje: 'NestJS es lo mejor para crear APIs escalables.',
        usuario: usuarios[1]._id,
        publicacion: publicaciones[5]._id,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      {
        mensaje: '¿Tienes algún tutorial para recomendar?',
        usuario: usuarios[2]._id,
        publicacion: publicaciones[5]._id,
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
      },
      {
        mensaje: 'La documentación oficial es excelente.',
        usuario: usuarios[3]._id,
        publicacion: publicaciones[5]._id,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ ${comentarios.length} comentarios creados`);

    // Resumen
    console.log('\n📊 === RESUMEN ===');
    console.log(`✅ ${usuarios.length} usuarios`);
    console.log(`✅ ${publicaciones.length} publicaciones`);
    console.log(`✅ ${comentarios.length} comentarios`);
    console.log('\n🔐 Credenciales de prueba:');
    console.log('Usuario: juanperez / Contraseña: Test1234');
    console.log('Usuario: mariagarcia / Contraseña: Test1234');
    console.log('Usuario: carloslopez / Contraseña: Test1234');
    console.log('Admin: admin / Contraseña: Test1234');
    console.log('\n✅ ¡Base de datos poblada exitosamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();