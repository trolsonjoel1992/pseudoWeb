import { RuntimeError } from "../errors";

// Este archivo se encargará de la gestión de la tabla de símbolos (memoria) 
// y la validación de rangos durante la ejecución del pseudocódigo.

export class Environment {
    private readonly values: Map<string, any> = new Map();
    private readonly enclosing: Environment | null;

    constructor(enclosing?: Environment) {
        this.enclosing = enclosing || null;
    }

    /**
     * Declara una nueva variable en el entorno actual.
     * @param name - El nombre de la variable.
     * @param value - El valor inicial de la variable.
     */
    define(name: string, value: any): void {
        this.values.set(name, value);
    }

    /**
     * Asigna un nuevo valor a una variable existente.
     * Si la variable no se encuentra en el entorno actual,
     * busca en los entornos superiores.
     * @param name - El nombre de la variable.
     * @param value - El nuevo valor.
     */
    assign(name: string, value: any): void {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }

        if (this.enclosing !== null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(`Variable no definida '${name}'.`);
    }

    /**
     * Busca y devuelve el valor de una variable.
     * Si la variable no se encuentra en el entorno actual,
     * busca en los entornos superiores.
     * @param name - El nombre de la variable a buscar.
     * @returns El valor de la variable.
     */
    lookup(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }

        if (this.enclosing !== null) {
            return this.enclosing.lookup(name);
        }

        throw new RuntimeError(`Variable no definida '${name}'.`);
    }
}
