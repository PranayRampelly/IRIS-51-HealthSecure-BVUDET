import axios from 'axios';

const pharmacyPriceComparisonService = {
  async getPriceComparison(query?: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/patient/pharmacy/price-comparison', {
      params: query ? { q: query } : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data as { medicines: Array<any> };
  },
};

export default pharmacyPriceComparisonService;
