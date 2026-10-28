import { api } from '../../shared/lib/axios.js';

export const searchFood = (q) =>
    api.get('/food/search', { params: { q } }).then((r) => r.data.products);

export const getFoodByBarcode = (barcode) =>
    api.get(`/food/${barcode}`).then((r) => r.data.product);