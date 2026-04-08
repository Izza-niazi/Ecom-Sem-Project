class SearchFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    search() {
        const kw = this.queryString.keyword;
        if (!kw) {
            return this;
        }
        const esc = String(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = { $regex: esc, $options: 'i' };
        this.query = this.query.find({
            $or: [
                { name: regex },
                { description: regex },
                { category: regex },
                { 'brand.name': regex },
            ],
        });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString }

        // fields to remove for category
        const removeFields = ["keyword", "page", "limit"];

        const brandRaw = queryCopy.brand;
        delete queryCopy.brand;

        removeFields.forEach(key => delete queryCopy[key]);

        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        const parsed = JSON.parse(queryString);
        if (brandRaw && String(brandRaw).trim()) {
            const esc = String(brandRaw).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            parsed['brand.name'] = { $regex: esc, $options: 'i' };
        }

        this.query = this.query.find(parsed);
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryString.page) || 1;

        const skipProducts = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skipProducts);
        return this;
    }
};

module.exports = SearchFeatures;