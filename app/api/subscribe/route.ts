import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Initialize Airtable
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      console.error('Missing Airtable credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Attempting to connect to Airtable...');
    console.log('Base ID:', baseId);
    console.log('Table ID:', tableId);

    // Configure Airtable - use table ID
    const base = new Airtable({ apiKey }).base(baseId);

    // Add email to Airtable - only send email field
    const records = await base(tableId).create([
      {
        fields: {
          email: email,
        },
      },
    ]);

    console.log('Successfully created records:', records);

    return NextResponse.json(
      { success: true, message: 'Email submitted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting to Airtable:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to submit email' },
      { status: 500 }
    );
  }
}

