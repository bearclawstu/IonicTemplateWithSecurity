"use strict";

module.exports.getSingle = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: "a1",
        title: "Personal training",
        description: "Get beasted",
        imageURL: "http://www.lepfitness.co.uk/wp-content/uploads/2018/10/FOC_blog_441535211861.jpg",
        instructor: "Jack Harnby",
        price: 20,
        duration: "60 mins",
        professionalId: "p1"
      }
    ])
  };
};
