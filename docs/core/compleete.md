flowchart TD
    A["Inicio: tokenize()"] --> B["¿while not isAtEnd?"]
    B -->|Sí| C["start = current"]
    C --> D["scanToken"]
    D --> B
    B -->|No| E["Agregar token EOF"]
    E --> F["Retornar lista de tokens"]

    subgraph "scanToken"
        D1["Obtener char = peek"] --> D2["¿Qué char?"]
        D2 -->|espacio, tab, retorno| D3["advance"]
        D3 --> D1
        D2 -->|salto de linea| D4["advance + addToken SaltoDeLinea"]
        D4 --> D1
        D2 -->|barra y asterisco| D5["skipBlockComment"]
        D5 --> D1
        D2 -->|comillas dobles o simples| D6["scanStringToken"]
        D6 --> D1
        D2 -->|digito| D7["scanNumberToken"]
        D7 --> D1
        D2 -->|letra, guion bajo o acento| D8["scanIdentifierToken"]
        D8 --> D1
        D2 -->|otro caracter| D9["scanOperatorToken"]
        D9 --> D1
    end

    subgraph "skipBlockComment"
        S1["avanza dos veces (/*)"] --> S2["¿while not isAtEnd?"]
        S2 -->|Sí| S3["¿peek es * y peekNext es / ?"]
        S3 -->|Sí| S4["avanza dos veces y retorna"]
        S3 -->|No| S5["avanza un caracter"]
        S5 --> S2
        S2 -->|No| S6["Lanzar LexerError: Comentario sin cerrar"]
    end

    subgraph "scanStringToken"
        T1["avanza (consume comilla)"] --> T2["value = vacio"]
        T2 --> T3["¿while not isAtEnd y peek != comilla?"]
        T3 -->|Sí| T4["¿peek es nueva linea?"]
        T4 -->|Sí| T5["Lanzar error: Cadena sin cerrar"]
        T4 -->|No| T6["¿peek es backslash?"]
        T6 -->|Sí| T7["avanza un caracter"] --> T8["¿caracter escapado?"]
        T8 -->|n, t, r, backslash, comillas| T9["value += caracter escapado"]
        T8 -->|otro| T10["value += caracter"]
        T9 --> T3
        T10 --> T3
        T6 -->|No| T11["value += avance"]
        T11 --> T3
        T3 -->|No| T12["¿isAtEnd?"]
        T12 -->|Sí| T13["Lanzar error: Cadena sin cerrar"]
        T12 -->|No| T14["avanza (consume comilla cierre)"]
        T14 --> T15["tipo = Alfanumerico o Caracter"]
        T15 --> T16["addToken"]
    end

    subgraph "scanNumberToken"
        N1["Mientras isDigit: avanza"] --> N2["tipo = Entero"]
        N2 --> N3["¿peek es punto y hay digito despues?"]
        N3 -->|Sí| N4["tipo = Real, avanza"]
        N4 --> N5["Mientras isDigit: avanza"]
        N5 --> N6
        N3 -->|No| N6["lexeme = sliceLexeme"]
        N6 --> N7["literal = parseInt o Number"]
        N7 --> N8["addToken"]
    end

    subgraph "scanIdentifierToken"
        I1["Mientras isAlphaNumeric: avanza"] --> I2["lexeme = sliceLexeme"]
        I2 --> I3["tokenType = resolveIdentifierType(lexeme)"]
        I3 --> I4["literal = true/false/null"]
        I4 --> I5["addToken"]
    end

    subgraph "scanOperatorToken"
        O1[switch] --> O2["':' asigna o dos puntos"]
        O2 --> O3["'+' suma"] --> O4["'-' resta"] --> O5["'*' potencia o multiplica"]
        O3 --> O6["'/' division"] --> O7["'=' igual"] --> O8["'<' menor, menor igual o distinto"]
        O4 --> O8
        O5 --> O9["'>' mayor o mayor igual"]
        O6 --> O10["'(' parentesis izq"] --> O11["')' parentesis der"]
        O7 --> O12["',' coma"] --> O13["';' punto y coma"] --> O14["'.' rango o error"]
        O8 --> O15["addToken segun corresponda"]
        O9 --> O15
        O10 --> O15
        O11 --> O15
        O12 --> O15
        O13 --> O15
        O14 --> O16["¿peekNext es punto?"]
        O16 -->|Sí| O17["addToken Rango"]
        O16 -->|No| O18["Lanzar LexerError: caracter inesperado"]
        O15 --> O19[retorna]
        O17 --> O19
        O18 --> O19
    end