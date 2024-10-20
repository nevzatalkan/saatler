import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MapPin, RefreshCw } from 'lucide-react';

interface PrayerTimes {
  Imsak: string;
  Gunes: string;
  Ogle: string;
  Ikindi: string;
  Aksam: string;
  Yatsi: string;
}

interface City {
  name: string;
  id: number;
}

const cities: City[] = [
  { name: 'İstanbul', id: 9541 },
  { name: 'Ankara', id: 9206 },
  { name: 'İzmir', id: 9560 },
  { name: 'Bursa', id: 9335 },
  { name: 'Antalya', id: 9225 },
  { name: 'Başakşehir', id: 9541 },
];

const prayerNamesTR: { [key: string]: string } = {
  Imsak: 'İmsak',
  Gunes: 'Güneş',
  Ogle: 'Öğle',
  Ikindi: 'İkindi',
  Aksam: 'Akşam',
  Yatsi: 'Yatsı'
};

// Statik namaz vakitleri (örnek veriler)
const staticPrayerTimes: { [key: string]: PrayerTimes } = {
  'İstanbul': {
    Imsak: '04:34',
    Gunes: '06:08',
    Ogle: '13:08',
    Ikindi: '16:59',
    Aksam: '20:00',
    Yatsi: '21:27'
  },
  'Ankara': {
    Imsak: '04:19',
    Gunes: '05:55',
    Ogle: '12:58',
    Ikindi: '16:51',
    Aksam: '19:53',
    Yatsi: '21:22'
  },
  // Diğer şehirler için de benzer şekilde ekleyebilirsiniz
};

function App() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City>(cities[0]);

  const fetchPrayerTimes = async (cityId: number) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`https://ezanvakti.herokuapp.com/vakitler/${cityId}/${today}`);
      const todayTimes = response.data[0];
      setPrayerTimes({
        Imsak: todayTimes.Imsak,
        Gunes: todayTimes.Gunes,
        Ogle: todayTimes.Ogle,
        Ikindi: todayTimes.Ikindi,
        Aksam: todayTimes.Aksam,
        Yatsi: todayTimes.Yatsi
      });
    } catch (err) {
      console.error('API error:', err);
      setError('Namaz vakitleri alınamadı. Statik veriler gösteriliyor.');
      // Hata durumunda statik verileri kullan
      setPrayerTimes(staticPrayerTimes[selectedCity.name] || staticPrayerTimes['İstanbul']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes(selectedCity.id);
  }, [selectedCity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold">Namaz saatleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Günlük Namaz Saatleri</h1>
        
        <div className="mb-6">
          <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">Şehir Seçin</label>
          <div className="relative">
            <select
              id="city-select"
              value={selectedCity.name}
              onChange={(e) => setSelectedCity(cities.find(city => city.name === e.target.value) || cities[0])}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded relative" role="alert">
            <strong className="font-bold">Uyarı: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {prayerTimes && (
          <ul className="space-y-4">
            {Object.entries(prayerTimes).map(([prayer, time]) => (
              <li key={prayer} className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-lg font-medium">{prayerNamesTR[prayer]}</span>
                <span className="text-lg font-semibold flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-500" />
                  {time}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => fetchPrayerTimes(selectedCity.id)}
          className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Yenile
        </button>
      </div>
    </div>
  );
}

export default App;