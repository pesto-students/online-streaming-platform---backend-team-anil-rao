class APIFeatures {
  //(Model.find(), req.query)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; //makes a hard copy the queryString

    const excludeFields = ["page", "sort", "limit", "fields"];

    excludeFields.forEach((el) => delete queryObj[el]);

    //Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    // console.log(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|ne|lte|lt|gt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(sortBy = "-") {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      // console.log(sortBy);

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-cDate");
    }

    return this;
  }
  sortByContentViews(sortBy = "-") {
      this.query = this.query.sort("contentViews");

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  search() {
    if (this.queryString.searchString) {
      var objectData = [];
      const objectFields = Object.keys(this.query.schema.paths).filter(
        (key) => this.query.schema.paths[key].instance === "Mixed"
      );
      objectFields.map((key) => {
        const tempArr = Object.keys(this.query.schema.paths[key].defaultValue);
        for (let i = 0; i < tempArr.length; i++) {
          objectData.push({
            [`${key}.${tempArr[i]}`]: { $regex: this.queryString.searchString, $options: "i" },
          });
        }
      });
      const stringFields = Object.keys(this.query.schema.paths)
        .filter(
          (key) =>
            this.query.schema.paths[key].instance === "String" ||
            this.query.schema.paths[key].instance === "Array"
        )
        .map((key) => ({
          [key]: { $regex: this.queryString.searchString, $options: "i" },
        }));

      const searchBy = {};
      searchBy["$or"] = [...stringFields, ...objectData];
      this.query = this.query.find(searchBy);
      return this;
    }
  }
}

module.exports = APIFeatures;
