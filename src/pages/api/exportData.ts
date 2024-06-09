// pages/api/exportData.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userData } = req.body;

    if (!userData) {
      return res.status(400).json({ error: 'User data is required' });
    }

    const fileName = `userData-${Date.now()}.json`;
    const filePath = path.join(process.cwd(), 'public', 'downloads', fileName);

    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the user data to a file
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));

    // Send the file path as a response
    res.status(200).json({ filePath: `/downloads/${fileName}` });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
