export interface ButtonStyle {
    textColor: string;
    backgroundColor: number;
}

export module ButtonStyle {
    export const primary: ButtonStyle = {textColor: '#ffffff', backgroundColor: 0x0d6efd};
    export const secondary: ButtonStyle = {textColor: '#ffffff', backgroundColor: 0x6c757d};
    export const success: ButtonStyle = {textColor: '#ffffff', backgroundColor: 0x198754};
    export const danger: ButtonStyle = {textColor: '#ffffff', backgroundColor: 0xdc3545};
    export const warning: ButtonStyle = {textColor: '#000000', backgroundColor: 0xffc107};
    export const info: ButtonStyle = {textColor: '#000000', backgroundColor: 0x0dcaf0};
    export const light: ButtonStyle = {textColor: '#000000', backgroundColor: 0xf8f9fa};
    export const dark: ButtonStyle = {textColor: '#ffffff', backgroundColor: 0x212529};
}