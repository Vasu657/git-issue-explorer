import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO = ({
    title = "GitFinder - Discover Open Source Issues to Contribute",
    description = "Find the best open-source issues on GitHub filtered by your tech stack and experience level. Bridging the gap between developers and impactful projects.",
    keywords = "github, open source, contribution, developer, coding, issues, gitfinder",
    image = "/og-image.png",
    url = "https://gitfinder.com",
}: SEOProps) => {
    const fullTitle = title.includes("GitFinder") ? title : `${title} | GitFinder`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
