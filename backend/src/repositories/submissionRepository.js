import { query } from '../config/postgres.js';

const mapSubmission = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,

    ticketId: row.ticket_id,
    ticketCode: row.ticket_code,

    version: row.version,

    title: row.title,
    description: row.description,

    files: row.files || [],

    externalLink: row.external_link,
    notes: row.notes,

    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,

    status: row.status,

    review: row.reviewed_by
      ? {
          reviewedBy: row.reviewed_by,
          reviewerName: row.reviewer_name,
          status: row.review_status,
          feedback: row.review_feedback,
          reviewedAt: row.reviewed_at,
        }
      : null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    submittedByUser: row.submitter_name
      ? {
          _id: row.submitted_by,
          name: row.submitter_name,
          email: row.submitter_email,
          role: row.submitter_role,
        }
      : undefined,
  };
};

const submissionSelect = `
  SELECT
    s.id,
    s.request_id AS ticket_id, s.request_id,
    s.ticket_code,
    s.version,
    s.title,
    s.description,
    s.external_link,
    s.notes,
    s.submitted_by,
    s.submitted_by_name,
    s.submitted_at,
    s.status,

    s.reviewed_by,
    s.reviewer_name,
    s.review_status,
    s.review_feedback,
    s.reviewed_at,

    s.created_at,
    s.updated_at,

    u.name AS submitter_name,
    u.email AS submitter_email,
    u.role AS submitter_role,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', sf.name,
            'url', sf.url,
            'size', sf.size,
            'type', sf.type
          )
          ORDER BY sf.created_at
        )
        FROM submission_files sf
        WHERE sf.submission_id = s.id
      ),
      '[]'::jsonb
    ) AS files

  FROM submissions s
  LEFT JOIN users u
    ON u.id = s.submitted_by
`;

export const findSubmissionById = async (id) => {
  const result = await query(
    `
    ${submissionSelect}
    WHERE s.id = $1
    LIMIT 1
    `,
    [id]
  );

  return mapSubmission(result.rows[0]);
};

export const findSubmissionByTicketAndVersion = async (
  ticketId,
  version
) => {
  const result = await query(
    `
    ${submissionSelect}
    WHERE s.request_id = $1
      AND s.version = $2
    LIMIT 1
    `,
    [ticketId, version]
  );

  return mapSubmission(result.rows[0]);
};

export const findLatestSubmissionByTicket = async (
  ticketId
) => {
  const result = await query(
    `
    ${submissionSelect}
    WHERE s.request_id = $1
    ORDER BY s.version DESC
    LIMIT 1
    `,
    [ticketId]
  );

  return mapSubmission(result.rows[0]);
};

export const findSubmissionsByTicket = async (
  ticketId
) => {
  const result = await query(
    `
    ${submissionSelect}
    WHERE s.request_id = $1
    ORDER BY s.version DESC
    `,
    [ticketId]
  );

  return result.rows.map(mapSubmission);
};

export const findSubmissionsBySubmitter = async (
  submittedBy
) => {
  const result = await query(
    `
    ${submissionSelect}
    WHERE s.submitted_by = $1
    ORDER BY s.created_at DESC
    `,
    [submittedBy]
  );

  return result.rows.map(mapSubmission);
};

export const createSubmission = async ({
  ticketId,
  ticketCode,
  version,
  title,
  description,
  externalLink = null,
  notes = null,
  submittedBy,
  submittedByName,
  status = 'PENDING_REVIEW',
  files = [],
}) => {
  const result = await query(
    `
    INSERT INTO submissions (
      request_id,
      ticket_code,
      version,
      title,
      description,
      external_link,
      notes,
      submitted_by,
      submitted_by_name,
      submitted_at,
      status
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      NOW(),
      $10
    )
    RETURNING id
    `,
    [
      ticketId,
      ticketCode,
      version,
      title,
      description,
      externalLink,
      notes,
      submittedBy,
      submittedByName,
      status,
    ]
  );

  const submissionId = result.rows[0].id;

  if (Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      await addSubmissionFile(
        submissionId,
        file
      );
    }
  }

  return findSubmissionById(submissionId);
};

export const addSubmissionFile = async (
  submissionId,
  {
    name,
    url,
    size = null,
    type = null,
  }
) => {
  const result = await query(
    `
    INSERT INTO submission_files (
      submission_id,
      name,
      url,
      size,
      type
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING
      id,
      name,
      url,
      size,
      type,
      created_at
    `,
    [
      submissionId,
      name,
      url,
      size,
      type,
    ]
  );

  return result.rows[0];
};

export const getSubmissionFiles = async (
  submissionId
) => {
  const result = await query(
    `
    SELECT
      id,
      name,
      url,
      size,
      type,
      created_at
    FROM submission_files
    WHERE submission_id = $1
    ORDER BY created_at ASC
    `,
    [submissionId]
  );

  return result.rows;
};

export const updateSubmission = async (
  id,
  updates = {}
) => {
  const allowedFields = {
    title: 'title',
    description: 'description',
    externalLink: 'external_link',
    notes: 'notes',
    status: 'status',
    submittedByName: 'submitted_by_name',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return findSubmissionById(id);
  }

  values.push(id);

  const result = await query(
    `
    UPDATE submissions
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    RETURNING id
    `,
    values
  );

  if (!result.rowCount) {
    return null;
  }

  return findSubmissionById(id);
};

export const markSubmissionPendingReview = async (
  id
) => {
  const result = await query(
    `
    UPDATE submissions
    SET
      status = 'PENDING_REVIEW',
      reviewed_by = NULL,
      reviewer_name = NULL,
      review_status = NULL,
      review_feedback = NULL,
      reviewed_at = NULL
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findSubmissionById(id);
};

export const approveSubmission = async (
  id,
  reviewerId,
  reviewerName,
  feedback = null
) => {
  const result = await query(
    `
    UPDATE submissions
    SET
      status = 'APPROVED',
      reviewed_by = $1,
      reviewer_name = $2,
      review_status = 'APPROVED',
      review_feedback = $3,
      reviewed_at = NOW()
    WHERE id = $4
    RETURNING id
    `,
    [
      reviewerId,
      reviewerName,
      feedback,
      id,
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return findSubmissionById(id);
};

export const requestSubmissionChanges = async (
  id,
  reviewerId,
  reviewerName,
  feedback
) => {
  if (!feedback || !String(feedback).trim()) {
    throw new Error(
      'Feedback is required when requesting changes.'
    );
  }

  const result = await query(
    `
    UPDATE submissions
    SET
      status = 'CHANGES_REQUESTED',
      reviewed_by = $1,
      reviewer_name = $2,
      review_status = 'CHANGES_REQUESTED',
      review_feedback = $3,
      reviewed_at = NOW()
    WHERE id = $4
    RETURNING id
    `,
    [
      reviewerId,
      reviewerName,
      feedback.trim(),
      id,
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return findSubmissionById(id);
};

export const reviewSubmission = async ({
  id,
  reviewerId,
  reviewerName,
  status,
  feedback = null,
}) => {
  if (
    status === 'CHANGES_REQUESTED' &&
    (!feedback || !String(feedback).trim())
  ) {
    throw new Error(
      'Feedback is required when requesting changes.'
    );
  }

  if (
    status !== 'APPROVED' &&
    status !== 'CHANGES_REQUESTED'
  ) {
    throw new Error(
      'Invalid submission review status.'
    );
  }

  const result = await query(
    `
    UPDATE submissions
    SET
      status = $1,
      reviewed_by = $2,
      reviewer_name = $3,
      review_status = $1,
      review_feedback = $4,
      reviewed_at = NOW()
    WHERE id = $5
    RETURNING id
    `,
    [
      status,
      reviewerId,
      reviewerName,
      feedback
        ? String(feedback).trim()
        : null,
      id,
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return findSubmissionById(id);
};

export const getNextSubmissionVersion = async (
  ticketId
) => {
  const result = await query(
    `
    SELECT
      COALESCE(MAX(version), 0)::int + 1 AS next_version
    FROM submissions
    WHERE request_id = $1
    `,
    [ticketId]
  );

  return result.rows[0].next_version;
};

export const countSubmissionsByTicket = async (
  ticketId
) => {
  const result = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM submissions
    WHERE request_id = $1
    `,
    [ticketId]
  );

  return result.rows[0].count;
};

export const deleteSubmission = async (
  id
) => {
  const result = await query(
    `
    DELETE FROM submissions
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export default {
  findSubmissionById,
  findSubmissionByTicketAndVersion,
  findLatestSubmissionByTicket,
  findSubmissionsByTicket,
  findSubmissionsBySubmitter,
  createSubmission,
  addSubmissionFile,
  getSubmissionFiles,
  updateSubmission,
  markSubmissionPendingReview,
  approveSubmission,
  requestSubmissionChanges,
  reviewSubmission,
  getNextSubmissionVersion,
  countSubmissionsByTicket,
  deleteSubmission,
};
