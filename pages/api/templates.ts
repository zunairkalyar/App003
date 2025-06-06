import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

const templatesFile = path.join(process.cwd(), 'data', 'templates.json');

async function readTemplates(): Promise<Template[]> {
  try {
    const data = await fs.readFile(templatesFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading templates:', error);
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
  try {
    await fs.mkdir(path.dirname(templatesFile), { recursive: true });
    await fs.writeFile(templatesFile, JSON.stringify(templates, null, 2));
  } catch (error: any) {
    console.error('Error writing templates:', error);
    throw new Error(`Failed to write templates: ${error.message}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET': {
      try {
        const templates = await readTemplates();
        return res.status(200).json(templates);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res
          .status(500)
          .json({ error: 'Failed to read templates', details: errorMessage });
      }
    }
    case 'POST': {
      try {
        const templates: Template[] = await readTemplates();
        const { name, text, status } = req.body as {
          name?: string;
          text?: string;
          status?: string;
        };

        if (!name || !text || !status) {
          return res
            .status(400)
            .json({ error: 'name, text, and status are required' });
        }

        const newTemplate: Template = {
          id: Date.now().toString(),
          name,
          text,
          status,
        };
        const index = templates.findIndex((t) => t.id === newTemplate.id);
        if (index > -1) {
          templates[index] = newTemplate;
        } else {
          templates.push(newTemplate);
        }
        await writeTemplates(templates);
        return res.status(200).json(newTemplate);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error processing template:', error);
        return res
          .status(500)
          .json({ error: 'Failed to process template', details: errorMessage });
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
  }
}
