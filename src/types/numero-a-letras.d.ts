// src/types/numero-a-letras.d.ts
declare module 'numero-a-letras' {
    interface NumeroALetrasOptions {
        plural?: string;
        singular?: string;
        centPlural?: string;
        centSingular?: string;
    }
  function numeroALetras(numero: number): string;
  export = numeroALetras;
}

