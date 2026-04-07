import { Helmet } from "react-helmet";

function keywordsToString(keywords) {
    if (keywords == null) return '';
    if (Array.isArray(keywords)) return keywords.filter(Boolean).join(', ');
    return String(keywords).trim();
}

const MetaData = ({
    title,
    description,
    keywords,
    robots,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    jsonLd,
}) => {
    const kw = keywordsToString(keywords);
    const ogT = (ogTitle || title || '').trim();
    const ogD = (ogDescription || description || '').trim();
    const shareUrl = (ogUrl || canonical || '').trim();

    return (
        <Helmet>
            <title>{title}</title>
            {description ? <meta name="description" content={description} /> : null}
            {kw ? <meta name="keywords" content={kw} /> : null}
            {robots ? <meta name="robots" content={robots} /> : null}
            {canonical ? <link rel="canonical" href={canonical} /> : null}

            {ogT ? <meta property="og:title" content={ogT} /> : null}
            {ogD ? <meta property="og:description" content={ogD} /> : null}
            {ogType ? <meta property="og:type" content={ogType} /> : null}
            {shareUrl ? <meta property="og:url" content={shareUrl} /> : null}
            {ogImage ? <meta property="og:image" content={ogImage} /> : null}

            <meta name="twitter:card" content={twitterCard} />
            {ogT ? <meta name="twitter:title" content={ogT} /> : null}
            {ogD ? <meta name="twitter:description" content={ogD} /> : null}
            {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

            {jsonLd ? (
                <script type="application/ld+json">
                    {typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd)}
                </script>
            ) : null}
        </Helmet>
    );
};

export default MetaData;
