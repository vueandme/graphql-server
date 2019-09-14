import shortid from 'shortid';

export default {
  Query: {
    allWines: (root, args, { db }) => db.get('wines').value(),
    getWine: (root, { id }, { db }) =>
      db
        .get('wines')
        .find({ id })
        .value(),
  },

  Mutation: {
    addWine: (root, { wine }, { pubsub, db }) => {
      const newWine = {
        id: shortid.generate(),
        title: wine.title,
        description: wine.description || '',
        variety: wine.variety || '',
        winery: wine.winery || '',
        province: wine.province || '',
        year: wine.year,
      };
      db.get('wines')
        .push(newWine)
        .last()
        .write();

      pubsub.publish('wines', { addWine: newWine });

      return newWine;
    },
    deleteWine: (root, { id }, { db }) => {
      db.get('wines')
        .remove({ id })
        .write();

      return true;
    },
  },

  Subscription: {
    wineSub: {
      resolve: payload => {
        return payload.addWine;
      },
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('wines'),
    },
  },
};
