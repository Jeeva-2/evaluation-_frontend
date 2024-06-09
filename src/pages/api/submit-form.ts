import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Files } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = './public/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files: Files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const { email, name, age, roll } = fields;
      const image = Array.isArray(files.image) && files.image.length > 0 ? files.image[0].filepath : null;
      res.status(200).json({ message: 'Form submitted successfully', data: { email, name, age, roll, image } });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;