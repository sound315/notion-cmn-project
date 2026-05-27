import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Contact } from '@/types/contact';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const CONTACTS_DB = process.env.NOTION_CONTACTS_DATABASE_ID!.replace(/-/g, '');

function pageToContact(page: PageObjectResponse): Contact {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = page.properties as any;

  return {
    id: page.id,
    name: props['이름']?.title?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '',
    email: props['이메일']?.email ?? '',
    message: props['메시지']?.rich_text?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '',
    read: props['읽음']?.checkbox ?? false,
    createdAt: props['문의일']?.date?.start ?? page.created_time,
  };
}

export async function createContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<Contact> {
  const page = await notion.pages.create({
    parent: { database_id: CONTACTS_DB },
    properties: {
      '이름': { title: [{ text: { content: input.name } }] },
      '이메일': { email: input.email },
      '메시지': { rich_text: [{ text: { content: input.message } }] },
      '읽음': { checkbox: false },
      '문의일': { date: { start: new Date().toISOString().split('T')[0] } },
    },
  });

  if (!isFullPage(page)) throw new Error('문의 저장 실패');
  return pageToContact(page);
}

export async function getContacts(): Promise<Contact[]> {
  const response = await notion.search({
    filter: { property: 'object', value: 'page' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
  });

  return response.results
    .filter(isFullPage)
    .filter((page) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbId = (page.parent as any).database_id?.replace(/-/g, '');
      return dbId === CONTACTS_DB;
    })
    .map(pageToContact)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markAsRead(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: { '읽음': { checkbox: true } },
  });
}
