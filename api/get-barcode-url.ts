// File: api/get-barcode-url.ts
import { createClient } from '@supabase/supabase-js';

// This is the Vercel Serverless Function handler
export default async function handler(request, response) {
  // Allow requests from any origin (CORS)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const barcodeNumber = request.query.number;

  if (!barcodeNumber) {
    return response.status(400).json({ error: 'Barcode number is required.' });
  }

  try {
    // These environment variables are securely accessed on the server
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not set.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('barcodes')
      .select('image_url')
      .eq('barcode_number', barcodeNumber)
      .single();

    if (error || !data) {
      throw new Error(`Barcode '${barcodeNumber}' not found.`);
    }

    return response.status(200).json({ imageUrl: data.image_url });

  } catch (error) {
    return response.status(404).json({ error: error.message });
  }
}
