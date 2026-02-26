function normalizeNumber(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return fallback;
  }
  return Math.floor(num);
}

function paginate(items, page, limit) {
  const p = normalizeNumber(page, 1);
  const l = normalizeNumber(limit, 10);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / l));
  const start = (p - 1) * l;
  const data = items.slice(start, start + l);
  return {
    data,
    meta: {
      page: p,
      limit: l,
      total,
      pages
    }
  };
}

module.exports = { paginate };
