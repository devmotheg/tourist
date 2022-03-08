/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = { ...reqQuery };
  }

  filter() {
    // Support mongoDB operators
    let queryStr = JSON.stringify(this.reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, m => `$${m}`);
    const queryObj = JSON.parse(queryStr);

    // Exclude special keywords
    const execludedFields = ["page", "sort", "limit", "fields"];
    for (const f of execludedFields) delete queryObj[f];

    // Querying
    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.replace(/,/g, " ");
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  select() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.replace(/,/g, " ");
      // We could also modify this a little bit to use .project()
      this.query = this.query.select(fields);
    }

    return this;
  }

  paginate() {
    const page = this.reqQuery.page * 1 || 1,
      limit = this.reqQuery.limit * 1 || 100;
    // If we're on page 3, we wanna display results ranging from 21-30
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
