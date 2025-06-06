import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

const templatesFile = path.join(process.cwd(), 'data', 'templates.json');

async function readTemplates(): Promise<Template[]> {
  try {
    const data = await fs.readFile(templatesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

interface Template {
  id: string;
  name: string;
  text: string;
  status: string;
}

async function writeTemplates(templates: Template[]) {
  await fs.mkdir(path.dirname(templatesFile), { recursive: true });
  await fs.writeFile(templatesFile, JSON.stringify(templates, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const templates = await readTemplates();
      return res.status(200).json(templates);
    }
    case 'POST': {
      const templates: Template[] = await readTemplates();
      const body = req.body as { id?: string; name: string; text: string; status: string };
      const newTemplate: Template = { id: body.id || Date.now().toString(), ...body };
      const index = templates.findIndex((t) => t.id === newTemplate.id);
      if (index > -1) {
        templates[index] = newTemplate;
      } else {
        templates.push(newTemplate);
      }
      await writeTemplates(templates);
      return res.status(200).json(newTemplate);
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
  }
}
