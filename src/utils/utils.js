function asciiDif(a, b) {
	return a.charCodeAt(0) - b.charCodeAt(0);
}

function unicodeChar(c) {
	switch (c) {
	  case 'b':
		return '♝';
	  case 'B':
		return '♗';
	  case 'k':
		return '♚';
	  case 'K':
		return '♔';
	  case 'n':
		return '♞';
	  case 'N':
		return '♘';
	  case ' ':
		return ' ';
	  case 'p':
		return '♟';
	  case 'P':
		return '♙';
	  case 'q':
		return '♛';
	  case 'Q':
		return '♕';
	  case 'r':
		return '♜';
	  case 'R':
		return '♖';
	  default:
		return c;
	}
  }

export { asciiDif, unicodeChar }


