import { RuntimeError } from "../errors";
import type { DataType } from "../parser/ast";

// Este archivo se encargará de la gestión de la tabla de símbolos (memoria) 
// y la validación de rangos durante la ejecución del pseudocódigo.

export class Environment {
    private readonly values: Map<string, unknown> = new Map();
    private readonly types: Map<string, DataType> = new Map();
    private readonly constants: Set<string> = new Set();
    private readonly enclosing: Environment | null;

    constructor(enclosing?: Environment) {
        this.enclosing = enclosing || null;
    }

    /**
     * Declara una nueva variable en el entorno actual.
     * @param name - El nombre de la variable.
     * @param value - El valor inicial de la variable.
     */
    define<T>(name: string, value: T, type?: DataType, isConstant = false): void {
        this.values.set(name, value);
        if (type !== undefined) {
            this.types.set(name, type);
        }
        if (isConstant) {
            this.constants.add(name);
        }
    }

    /**
     * Asigna un nuevo valor a una variable existente.
     * Si la variable no se encuentra en el entorno actual,
     * busca en los entornos superiores.
     * @param name - El nombre de la variable.
     * @param value - El nuevo valor.
     */
    assign(name: string, value: unknown): void {
        if (this.values.has(name)) {
            if (this.constants.has(name)) {
                throw new RuntimeError(`No se puede reasignar la constante '${name}'.`);
            }
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
    lookup(name: string): unknown {
        if (this.values.has(name)) {
            return this.values.get(name);
        }

        if (this.enclosing !== null) {
            return this.enclosing.lookup(name);
        }

        throw new RuntimeError(`Variable no definida '${name}'.`);
    }

    lookupType(name: string): DataType | null {
        if (this.types.has(name)) {
            return this.types.get(name) ?? null;
        }

        if (this.enclosing !== null) {
            return this.enclosing.lookupType(name);
        }

        return null;
    }

    has(name: string): boolean {
        if (this.values.has(name)) {
            return true;
        }

        if (this.enclosing !== null) {
            return this.enclosing.has(name);
        }

        return false;
    }

    isConstant(name: string): boolean {
        if (this.constants.has(name)) {
            return true;
        }

        if (this.enclosing !== null) {
            return this.enclosing.isConstant(name);
        }

        return false;
    }

    snapshot(): Record<string, unknown> {
        const merged: Record<string, unknown> = this.enclosing ? this.enclosing.snapshot() : {};

        for (const [name, value] of this.values.entries()) {
            merged[name] = value;
        }

        return merged;
    }
}
