interface LabelStyles {
    backgroundColor: string;
    color: string;
    border: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function darken(hex: string, percent: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.floor(rgb.r * (1 - percent));
    const g = Math.floor(rgb.g * (1 - percent));
    const b = Math.floor(rgb.b * (1 - percent));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getLabelStyles(hexColor: string, theme: string | undefined): LabelStyles {
    // Ensure hexColor has # prefix for processing
    const hex = hexColor.startsWith("#") ? hexColor : `#${hexColor}`;
    const rgb = hexToRgb(hex);

    if (!rgb) {
        return {
            backgroundColor: "rgba(128, 128, 128, 0.15)",
            color: "gray",
            border: "1px solid rgba(128, 128, 128, 0.2)",
        };
    }

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    const isDarkTheme = theme === "dark";

    if (isDarkTheme) {
        // In dark theme, we use a very transparent background and the original color for text
        return {
            backgroundColor: `${hex}25`, // 15% opacity hex
            color: hex,
            border: `1px solid ${hex}40`, // 25% opacity hex
        };
    } else {
        // In light theme, if the color is too light, we darken it for the text
        // A luminance > 0.5 is generally considered "light"
        const textColor = luminance > 0.5 ? darken(hex, 0.4) : hex;

        return {
            backgroundColor: `${hex}15`, // 8% opacity hex
            color: textColor,
            border: `1px solid ${hex}30`, // 18% opacity hex
        };
    }
}
