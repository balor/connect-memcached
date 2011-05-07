index.html: lib/connect-memcached.js
	dox \
		--title "connection-memcached" \
		--desc "Memcached session store for Connect" \
		--ribbon "https://github.com/balor/connection-memcached" \
		$< > $@
