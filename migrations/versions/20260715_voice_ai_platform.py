"""Enterprise Voice AI Platform schema changes

Revision ID: 20260715_voice_ai_platform
Revises: previous_revision_id
Create Date: 2026-07-15 07:55:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260715_voice_ai_platform'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. voice_sessions table
    op.create_table(
        'voice_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False, default=0),
        sa.Column('channel', sa.String(30), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. voice_conversations table
    op.create_table(
        'voice_conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('messages_count', sa.Integer(), nullable=False, default=0),
        sa.Column('last_active', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['session_id'], ['voice_sessions.id'], ondelete='CASCADE')
    )

    # 3. voice_messages table
    op.create_table(
        'voice_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('sender', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('audio_url', sa.String(255), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=False, default=0),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['conversation_id'], ['voice_conversations.id'], ondelete='CASCADE')
    )

    # 4. voice_transcripts table
    op.create_table(
        'voice_transcripts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(20), nullable=False), # call, meeting, session
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('full_text', sa.Text(), nullable=False),
        sa.Column('formatted_text', sa.Text(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. voice_recordings table
    op.create_table(
        'voice_recordings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(20), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('file_url', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False),
        sa.Column('format', sa.String(10), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. voice_profiles table
    op.create_table(
        'voice_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('voice_name', sa.String(50), nullable=False),
        sa.Column('language_code', sa.String(10), nullable=False),
        sa.Column('gender', sa.String(10), nullable=False),
        sa.Column('pitch', sa.Float(), nullable=False, default=0.0),
        sa.Column('speaking_rate', sa.Float(), nullable=False, default=1.0),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. voice_preferences table
    op.create_table(
        'voice_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('wake_word_enabled', sa.Boolean(), nullable=False, default=False),
        sa.Column('wake_word', sa.String(30), nullable=True),
        sa.Column('silence_timeout_ms', sa.Integer(), nullable=False, default=3000),
        sa.Column('auto_record', sa.Boolean(), nullable=False, default=True),
        sa.Column('preferred_channel', sa.String(30), nullable=False, default='browser'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. voice_commands table
    op.create_table(
        'voice_commands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('command_pattern', sa.String(100), nullable=False),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('min_confidence', sa.Float(), nullable=False, default=0.8),
        sa.PrimaryKeyConstraint('id')
    )

    # 9. voice_calls table
    op.create_table(
        'voice_calls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('call_sid', sa.String(100), nullable=False, unique=True),
        sa.Column('from_number', sa.String(30), nullable=False),
        sa.Column('to_number', sa.String(30), nullable=False),
        sa.Column('direction', sa.String(15), nullable=False),
        sa.Column('status', sa.String(25), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=False, default=0),
        sa.PrimaryKeyConstraint('id')
    )

    # 10. voice_call_participants table
    op.create_table(
        'voice_call_participants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('call_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['call_id'], ['voice_calls.id'], ondelete='CASCADE')
    )

    # 11. voice_meetings table
    op.create_table(
        'voice_meetings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_title', sa.String(100), nullable=False),
        sa.Column('provider', sa.String(30), nullable=False), # zoom, google_meet, teams
        sa.Column('meeting_url', sa.String(255), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False, default=0),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. voice_meeting_participants table
    op.create_table(
        'voice_meeting_participants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), nullable=False),
        sa.Column('is_ai_agent', sa.Boolean(), nullable=False, default=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['meeting_id'], ['voice_meetings.id'], ondelete='CASCADE')
    )

    # 13. voice_meeting_summaries table
    op.create_table(
        'voice_meeting_summaries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.Integer(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=False),
        sa.Column('general_vibe', sa.String(50), nullable=True),
        sa.Column('key_topics', sa.JSON(), nullable=True),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['meeting_id'], ['voice_meetings.id'], ondelete='CASCADE')
    )

    # 14. voice_action_items table
    op.create_table(
        'voice_action_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.Integer(), nullable=False),
        sa.Column('assignee_name', sa.String(100), nullable=False),
        sa.Column('task_description', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(15), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(15), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['meeting_id'], ['voice_meetings.id'], ondelete='CASCADE')
    )

    # 15. voice_analytics table
    op.create_table(
        'voice_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('word_count', sa.Integer(), nullable=False, default=0),
        sa.Column('avg_response_time_ms', sa.Integer(), nullable=False, default=0),
        sa.Column('audio_duration_seconds', sa.Integer(), nullable=False, default=0),
        sa.Column('silence_percentage', sa.Float(), nullable=False, default=0.0),
        sa.Column('sentiment_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 16. voice_audit_logs table
    op.create_table(
        'voice_audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('channel', sa.String(30), nullable=False),
        sa.Column('permission_checked', sa.Boolean(), nullable=False, default=True),
        sa.Column('ip_address', sa.String(45), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('voice_audit_logs')
    op.drop_table('voice_analytics')
    op.drop_table('voice_action_items')
    op.drop_table('voice_meeting_summaries')
    op.drop_table('voice_meeting_participants')
    op.drop_table('voice_meetings')
    op.drop_table('voice_call_participants')
    op.drop_table('voice_calls')
    op.drop_table('voice_commands')
    op.drop_table('voice_preferences')
    op.drop_table('voice_profiles')
    op.drop_table('voice_recordings')
    op.drop_table('voice_transcripts')
    op.drop_table('voice_messages')
    op.drop_table('voice_conversations')
    op.drop_table('voice_sessions')
