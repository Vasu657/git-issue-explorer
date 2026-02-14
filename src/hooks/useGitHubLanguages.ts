import { useQuery } from "@tanstack/react-query";

const LINGUIST_LANGUAGES_URL = "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml";

interface LinguistLanguage {
    name: string;
    type?: string;
    color?: string;
}

/**
 * Parse GitHub Linguist languages.yml format
 * Format is YAML with language names as keys
 */
function parseLinguistYaml(yamlText: string): string[] {
    const languages: string[] = [];
    const lines = yamlText.split('\n');

    for (const line of lines) {
        // Language names are at the start of lines with no indentation followed by ':'
        if (line.match(/^[A-Z0-9]/i) && line.includes(':') && !line.startsWith(' ')) {
            const languageName = line.split(':')[0].trim();
            if (languageName && languageName !== '---') {
                languages.push(languageName);
            }
        }
    }

    return languages.sort();
}

/**
 * Fetch complete list of programming languages from GitHub Linguist
 * This provides comprehensive coverage of all GitHub-supported languages
 */
export function useGitHubLanguages() {
    const { data: languages, isLoading, error } = useQuery({
        queryKey: ["github-linguist-languages"],
        queryFn: async () => {
            try {
                const response = await fetch(LINGUIST_LANGUAGES_URL);

                if (!response.ok) {
                    throw new Error(`Failed to fetch languages: ${response.status}`);
                }

                const yamlText = await response.text();
                const languages = parseLinguistYaml(yamlText);

                return languages;
            } catch (error) {
                console.error("Failed to fetch GitHub Linguist languages:", error);
                // Fallback to minimal essential list if API fails
                return [
                    "C", "C#", "C++", "CSS", "Dart", "Go", "HTML", "Java",
                    "JavaScript", "Kotlin", "PHP", "Python", "Ruby", "Rust",
                    "Scala", "Shell", "Swift", "TypeScript", "Vue"
                ];
            }
        },
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
        retry: 1,
    });

    return { languages: languages || [], isLoading, error };
}
