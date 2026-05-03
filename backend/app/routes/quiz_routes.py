from flask import Blueprint, request, jsonify
from ..models import QuizQuestion

quiz_bp = Blueprint('quiz', __name__)

SKIN_TYPE_MAP = {
    'mostly_a': {
        'type': 'Dry',
        'recommendations': (
            'Your skin tends to be dry and may feel tight. Focus on hydrating products with '
            'hyaluronic acid, ceramides, and rich moisturizers. Avoid harsh cleansers and use '
            'gentle, cream-based products. Always apply moisturizer while your skin is still damp.'
        )
    },
    'mostly_b': {
        'type': 'Normal',
        'recommendations': (
            'You have well-balanced skin! Maintain your routine with gentle cleansers, lightweight '
            'moisturizers, and daily sunscreen. Add antioxidant serums like vitamin C for extra '
            'protection. Your skin is adaptable, so focus on prevention and maintenance.'
        )
    },
    'mostly_c': {
        'type': 'Oily',
        'recommendations': (
            "Your skin produces excess oil, especially in the T-zone. Use oil-free, non-comedogenic "
            "products. Incorporate salicylic acid or niacinamide to control sebum. Don't skip "
            "moisturizer — use a lightweight, gel-based one. Clay masks weekly can help absorb excess oil."
        )
    },
}


@quiz_bp.route('/quiz/questions', methods=['GET'])
def get_questions():
    questions = QuizQuestion.query.order_by(QuizQuestion.order).all()
    return jsonify({'questions': [q.to_dict() for q in questions]}), 200


@quiz_bp.route('/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({'error': 'Please send {"answers": {"question_id": "a/b/c", ...}}'}), 400

    answers = data['answers']
    questions = QuizQuestion.query.order_by(QuizQuestion.order).all()

    counts = {'a': 0, 'b': 0, 'c': 0}
    for q in questions:
        answer = answers.get(str(q.id))
        if answer in counts:
            counts[answer] += 1

    dominant = max(counts, key=counts.get)
    result_data = SKIN_TYPE_MAP.get(f'mostly_{dominant}', SKIN_TYPE_MAP['mostly_b'])

    return jsonify({
        'skin_type': result_data['type'],
        'recommendations': result_data['recommendations'],
        'answer_counts': counts
    }), 200
