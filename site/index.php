<?php
	header('Content-Type: text/html; charset=utf-8');

	include 'filecache.php';
?>
<!DOCTYPE html>
<html lang="is">
	<head>
		<meta charset="UTF-8">
		<title>Hvað er í bíó</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<meta name="apple-mobile-web-app-capable" content="yes">
		<link rel="apple-touch-icon" sizes="60x60"  href="images/apple-touch-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="76x76" href="images/apple-touch-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="120x120" href="images/apple-touch-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="152x152" href="images/apple-touch-icon-156x156.png">
		<link rel="shortcut icon" sizes="16x16" href="images/icon-16x16.png">
		<link rel="shortcut icon" sizes="32x32" href="images/icon-32x32.png">
		<link rel="shortcut icon" sizes="128x128" href="images/icon-128x128.png">
		<link rel="shortcut icon" sizes="196x196" href="images/icon-196x196.png">

		<meta name="description" content="Hvað er í bíó er fljótlegt yfirlit yfir bíódagskrá kvöldsins á öllu landinu og leyfir þér að ráða tíma, bíóhúsi og lágmarkseinkun.">

        <meta property="og:title"       content="Hvað er í bíó?">
        <meta property="og:site_name"   content="Hvað er í bíó?">
        <meta property="og:type"        content="website">
        <meta property="og:url"         content="http://www.hvaderibio.is">
        <meta property="og:image"       content="http://www.hvaderibio.is/images/icon-512x512.png">
        <meta property="og:description" content="Hvað er í bíó gefur þér fljótlegt yfirlit yfir bíódagskrá kvöldsins og leyfir þér að ráða tíma, bíóhúsi og lágmarkseinkun.">

		<link rel="stylesheet" href="style.css">

		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-20956924-4', 'hvaderibio.is');
			ga('send', 'pageview');
		</script>

		<script type="text/javascript" src="//use.typekit.net/kkk7ayb.js"></script>
		<script type="text/javascript">try{Typekit.load();}catch(e){}</script>
	</head>


	<body>

		<h1>Hvað er í bíó?</h1>


		<div class="filters">
			<div class="filters-wrap">
				<div class="two-col">
					<div class="input-box time-range">
						<label for="from-time">Frá</label>
						<div class="range-wrap">
							<span class="range-mark from">00:00</span>
							<div class="range">
								<input id="from-time" type="range" min="0" max="24" step="0.25" name="from-time" value="0">
								<output for="from-time">0</output>
							</div>
							<span class="range-mark to">24:00</span>
						</div>
					</div>
					<div class="input-box time-range">
						<label for="to-time">Til</label>
						<div class="range-wrap">
							<span class="range-mark from">00:00</span>
							<div class="range">
								<input id="to-time" type="range" min="0" max="24" step="0.25" name="to-time" value="24">
								<output for="to-time">24</output>
							</div>
							<span class="range-mark to">24:00</span>
						</div>
					</div>
				</div>
				<div class="two-col">
					<div class="input-box rating-range">
						<label for="rating-range">Einkunn</label>
						<div class="range-wrap">
							<span class="range-mark from">0</span>
							<div class="range">
								<input id="rating-range" type="range" min="0" max="10" step="0.1" name="rating-range" value="0">
								<output for="rating-range">24</output>
							</div>
							<span class="range-mark to">10</span>
						</div>
					</div>
					<div class="input-box text-filter">
						<label for="text-filter">Heiti</label>
						<input id="text-filter" type="text" placeholder="Pulp Fiction">
					</div>
				</div>
			</div>
			<div class="filters-wrap place-filter">
				<ul></ul>
			</div>
		</div>


		<div class="movies-wrap">

			<?php
				$service_url = 'http://apis.is/cinema/';
				$curl = curl_init($service_url);
				curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
				$response = curl_exec($curl);
				if ($response === false) {
				    $info = curl_getinfo($curl);
				    curl_close($curl);
				    die('Failed to retreve data. Additioanl info: ' . var_export($info));
				}
				curl_close($curl);

				$jsonDecoded = json_decode($response);

				if (empty($jsonDecoded->results)) {
					echo '<p class="no-data-message">Dularfullt. <strong>Engar myndir fundust.</strong><br>Líklegast hafa gögnin lent í umferðarteppu eða mögulega er bara ekkert í bíó í dag. Prófaðu aftur seinna.</p>';
				}

				foreach ($jsonDecoded->results as $movie) {
					$title = $movie->title;
					$restriction = $movie->restricted;
					$imageUrl = $movie->image;
					$imageType = end(explode('.', $imageUrl));
					$imageName = urlencode($title . '.' . $imageType);
			?>

			<article class="movie" data-id="<?=$title?>">
				<header>
					<div class="rating">
						<?=current(explode('/', $movie->imdb))?>
						<?php if ($movie->imdb != '') { ?>
						<span>Einkunn frá IMDB með <?=implode(array_slice(explode('10 ', $movie->imdb), 1, 1))?></span>
						<?php } ?>
					</div>
					<h2><?=$movie->title?><?php if ($restriction != '') { ?>
						<i<?php
							if (is_numeric(current(explode(' ', $restriction))))
								echo ' class="warning"';
						?>><?=$restriction?></i>
					<?php } ?></h2>
					<a class="mark" href="#">Merkja</a>
				</header>
				<a class="more" href="#">Sjá meira</a>
				<aside class="extra">
					<img src="<?=$imageUrl?>" alt="Plakat fyrir <?=$title?>">
					<div class="padding"></div>
					<div class="content">
						<?php
							foreach ($movie->showtimes as $showtime) {
								$theater = $showtime->theater;
						?>
						<div class="showplace" data-place="<?=$theater?>">
							<h3><?=$theater?>:</h3>
							<ul>
								<?php foreach ($showtime->schedule as $time) { ?>
								<li data-time="<?=current(explode(' ', $time))?>"><?=$time?></li>
								<?php } ?>
							</ul>
						</div>
						<?php } ?>
					</div>
				</aside>
			</article>

			<?php } ?>

		</div>

		<footer>Verkefni eftir <a href="http://www.hugihlynsson.com/">Huga Hlynsson</a> - <a href="mailto:hugihlynsson@gmail.com">hugihlynsson@gmail.com</a></footer>

		<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
		<script src="main.js"></script>
	</body>
</html>

<?php
	writeCache($cacheFile, ob_get_contents());
?>
