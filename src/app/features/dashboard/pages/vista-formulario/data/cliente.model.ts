export interface DatosPersonales {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: Date;
  genero: string;
  correo_electronico: string;
  numero_telefono: string;
}

export interface Cliente {
  persona: DatosPersonales;
}

export const ClienteInicial = (): Cliente => ({
  persona: {
    nombres: '',
    apellidos: '',
    fecha_nacimiento: new Date(),
    genero: '',
    correo_electronico: '',
    numero_telefono: '',
  },
});
