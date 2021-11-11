const advanceResults = (model, populate) => async (req, res, next) => {
    let query;

    //copy the query from the request
    const reqQuery = { ...req.query };

    //fields to be removed
    const removeFields = ['select', 'limit', 'page', 'sort'];
    //loop over removeFields and remove it from the reqQuery
    removeFields.forEach(field => delete reqQuery[field]);

    //create query STRING
    let queryStr = JSON.stringify(reqQuery);
    // create operators
    queryStr = queryStr.replace(/\b('|gt|gte|lt|lte|in|')\b/g, match => `$${match}`);

    //start making the query
    query = model.find(JSON.parse(queryStr));

    //select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //populate
    if (populate) {
        query = query.populate(populate);
    }

    //executing tthe query
    const results = await query;
    res.advanceResult = {
        sucess: true,
        count: total,
        pagination,
        data: results
    }

    next();

}

module.exports = advanceResults;