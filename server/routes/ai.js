const express = require('express');
const Commit = require('../models/Commit');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/ai/weekly-digest
 * Free version using Groq
 */
router.post('/weekly-digest', auth, async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY is not configured',
      });
    }

    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const commits = await Commit.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: 1 })
      .select('date hour dayOfWeek repoName message additions deletions')
      .lean();

    if (commits.length === 0) {
      return res.json({
        success: true,
        digest: "You didn't push any commits in the last 7 days. Time to ship something!",
        commitCount: 0,
      });
    }

    // Prepare summary data
    const repoStats = {};
    let totalAdditions = 0;
    let totalDeletions = 0;
    const dayActivity = Array(7).fill(0);
    const hourActivity = Array(24).fill(0);

    commits.forEach((c) => {
      const repo = c.repoName || 'Unknown';
      if (!repoStats[repo]) repoStats[repo] = { count: 0, additions: 0, deletions: 0 };
      repoStats[repo].count += 1;
      repoStats[repo].additions += c.additions || 0;
      repoStats[repo].deletions += c.deletions || 0;

      totalAdditions += c.additions || 0;
      totalDeletions += c.deletions || 0;

      if (c.dayOfWeek != null) dayActivity[c.dayOfWeek] += 1;
      if (c.hour != null) hourActivity[c.hour] += 1;
    });

    const topRepos = Object.entries(repoStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, s]) => `${name} (${s.count} commits)`);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busiestDay = dayNames[dayActivity.indexOf(Math.max(...dayActivity))];
    const peakHour = hourActivity.indexOf(Math.max(...hourActivity));

    const sampleMessages = commits
      .slice(-12)
      .map((c) => `- [${c.repoName}] ${(c.message || '').slice(0, 70)}`)
      .join('\n');

    const prompt = `You are a friendly engineering coach. Write a short weekly coding digest.

Data for the last 7 days:
- Total commits: ${commits.length}
- Lines added: +${totalAdditions}
- Lines deleted: -${totalDeletions}
- Busiest day: ${busiestDay}
- Peak hour (UTC): ${peakHour}:00
- Top repositories: ${topRepos.join(', ')}

Recent commits:
${sampleMessages}

Write 3-5 short paragraphs in second person ("You..."). Be warm, specific, and encouraging. No bullet points.`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // currently free & excellent
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    const digest = data.choices?.[0]?.message?.content?.trim() || 'Could not generate summary.';

    res.json({
      success: true,
      digest,
      commitCount: commits.length,
      stats: {
        totalAdditions,
        totalDeletions,
        busiestDay,
        peakHour,
      },
    });
  } catch (err) {
    console.error('Weekly digest error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate weekly digest',
    });
  }
});

module.exports = router;