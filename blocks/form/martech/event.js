export function initWebSDK(path, config) {
  // Preparing the alloy queue
  if (!window.alloy) {
    // eslint-disable-next-line no-underscore-dangle
    (window.__alloyNS ||= []).push('alloy');
    window.alloy = (...args) => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        window.alloy.q.push([resolve, reject, args]);
      });
    });
    window.alloy.q = [];
  }
  // Loading and configuring the websdk
  return new Promise((resolve) => {
    import(path)
      .then(() => window.alloy('configure', config))
      .then(resolve);
  });
}

export const getXDMMappedData = (xdmDataRef, value, data = {}) => {
  const keys = xdmDataRef?.split('.');
  keys.reduce((obj, key, index) => {
    if (index === keys.length - 1) {
      obj[key] = value;
    } else {
      obj[key] = obj[key] || {};
    }
    return obj[key];
  }, data);
  return data;
};

function extractSegments(response) {
  return response?.destinations
    .flatMap((destination) => destination.segments.map((segment) => segment.id));
}

function extractOffersDecisions(response) {
  return response?.decisions?.reduce((acc, offer) => {
    const { id, name } = offer.placement;
    const { format } = offer?.items?.[0]?.data || {};
    const content = offer.items[0].data.content || offer.items[0].data.deliveryURL;
    acc[id] = { format, content, name };
    return acc;
  }, {});
}

export async function getAudiences(xdm, data) {
  const response = await window.alloy('sendEvent', {
    renderDecisions: false,
    type: 'form.view',
    data,
    xdm,
    decisionScopes: [
      'eyJ4ZG06YWN0aXZpdHlJZCI6Inhjb3JlOm9mZmVyLWFjdGl2aXR5OjE5MWI5ZDM5OWRiNDUyOTgiLCJ4ZG06cGxhY2VtZW50SWQiOiJ4Y29yZTpvZmZlci1wbGFjZW1lbnQ6MTkxYjk3ZjJmZjMzOTU5NiJ9',
      'eyJ4ZG06YWN0aXZpdHlJZCI6Inhjb3JlOm9mZmVyLWFjdGl2aXR5OjE5MWI5ZDM5OWRiNDUyOTgiLCJ4ZG06cGxhY2VtZW50SWQiOiJ4Y29yZTpvZmZlci1wbGFjZW1lbnQ6MTkxYjk3ZDMyNzJiNDg2MSJ9',
    ],
  });
  const segmentIds = extractSegments(response);
  const offers = extractOffersDecisions(response);
  console.log(segmentIds, offers, response);
  return { segmentIds, offers };
}
